import express from 'express'
import cors from 'cors'
import crypto from 'crypto'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SCORES_FILE = join(__dirname, 'scores.json')
const MAX_SCORES_PER_USER = 10
const ADMIN_PASSWORD = 'admin123'

// Simple token store (in production use JWT or sessions)
const validTokens = new Set()

const app = express()
app.use(cors())
app.use(express.json({ limit: '1kb' }))

// --- Helpers ---

function readScores() {
  if (!existsSync(SCORES_FILE)) return []
  try {
    return JSON.parse(readFileSync(SCORES_FILE, 'utf-8'))
  } catch {
    return []
  }
}

function writeScores(scores) {
  writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2))
}

// Sanitize: only allow alphanumeric, Turkish chars, spaces, underscores, hyphens
function sanitizeName(name) {
  if (typeof name !== 'string') return ''
  return name
    .replace(/[<>"'&\/\\`]/g, '')     // strip HTML/script chars
    .replace(/[\x00-\x1F\x7F]/g, '')  // strip control chars
    .trim()
    .slice(0, 20)
}

function isValidScore(score) {
  return typeof score === 'number' && Number.isFinite(score) && score >= 0 && score <= 999999
}

// Rate limiting per IP (simple in-memory)
const rateLimitMap = new Map()
function rateLimit(ip, maxPerMinute = 30) {
  const now = Date.now()
  const entry = rateLimitMap.get(ip) || { count: 0, resetAt: now + 60000 }
  if (now > entry.resetAt) {
    entry.count = 0
    entry.resetAt = now + 60000
  }
  entry.count++
  rateLimitMap.set(ip, entry)
  return entry.count > maxPerMinute
}

// Admin auth middleware
function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token || !validTokens.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
}

// --- Routes ---

// Get all scores (grouped by user, sorted by highest)
app.get('/api/scores', (req, res) => {
  const scores = readScores()
  scores.sort((a, b) => b.score - a.score)
  res.json(scores)
})

// Get scores for a specific user
app.get('/api/scores/:name', (req, res) => {
  const name = sanitizeName(req.params.name)
  const scores = readScores()
  const userScores = scores.filter(s => s.name === name).sort((a, b) => b.score - a.score)
  res.json(userScores)
})

// Submit a new score (auto-save, no manual trigger)
app.post('/api/scores', (req, res) => {
  const ip = req.ip
  if (rateLimit(ip, 30)) {
    return res.status(429).json({ error: 'Too many requests' })
  }

  const name = sanitizeName(req.body.name)
  const score = req.body.score

  if (!name || name.length < 1) {
    return res.status(400).json({ error: 'Valid name required' })
  }
  if (!isValidScore(score)) {
    return res.status(400).json({ error: 'Valid score required (0-999999)' })
  }

  const scores = readScores()

  // Get this user's scores
  const userScores = scores.filter(s => s.name === name)
  const otherScores = scores.filter(s => s.name !== name)

  // Add new score
  userScores.push({
    id: crypto.randomUUID(),
    name,
    score,
    date: new Date().toISOString(),
  })

  // Keep only top 10 for this user
  userScores.sort((a, b) => b.score - a.score)
  const trimmedUserScores = userScores.slice(0, MAX_SCORES_PER_USER)

  const allScores = [...otherScores, ...trimmedUserScores]
  writeScores(allScores)

  res.json({ success: true, kept: trimmedUserScores.length })
})

// Admin login with brute-force protection
const loginAttempts = new Map()
app.post('/api/admin/login', (req, res) => {
  const ip = req.ip
  const now = Date.now()
  const attempts = loginAttempts.get(ip) || { count: 0, lockedUntil: 0 }

  if (now < attempts.lockedUntil) {
    const waitSec = Math.ceil((attempts.lockedUntil - now) / 1000)
    return res.status(429).json({ error: `Çok fazla deneme. ${waitSec}s bekle.` })
  }

  const password = typeof req.body.password === 'string' ? req.body.password : ''

  if (password === ADMIN_PASSWORD) {
    loginAttempts.delete(ip)
    const token = crypto.randomUUID()
    validTokens.add(token)
    // Token expires in 1 hour
    setTimeout(() => validTokens.delete(token), 3600000)
    res.json({ success: true, token })
  } else {
    attempts.count++
    if (attempts.count >= 5) {
      attempts.lockedUntil = now + 60000 // 1 min lock
      attempts.count = 0
    }
    loginAttempts.set(ip, attempts)
    res.status(401).json({ error: 'Yanlış şifre' })
  }
})

// Admin: delete a score
app.delete('/api/scores/:id', requireAdmin, (req, res) => {
  const id = req.params.id
  if (typeof id !== 'string' || id.length > 50) {
    return res.status(400).json({ error: 'Invalid id' })
  }

  const scores = readScores()
  const filtered = scores.filter(s => s.id !== id)
  if (filtered.length === scores.length) {
    return res.status(404).json({ error: 'Score not found' })
  }
  writeScores(filtered)
  res.json({ success: true })
})

// Admin: delete all scores for a user
app.delete('/api/scores/user/:name', requireAdmin, (req, res) => {
  const name = sanitizeName(req.params.name)
  const scores = readScores()
  const filtered = scores.filter(s => s.name !== name)
  writeScores(filtered)
  res.json({ success: true, deleted: scores.length - filtered.length })
})

app.listen(3001, () => {
  console.log('API server running on http://localhost:3001')
})
