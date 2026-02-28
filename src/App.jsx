import { useState, useEffect, useRef, useCallback } from 'react'
import { LEVELS, OBSTACLE_TYPES, CANVAS_HEIGHT, GROUND_Y, PLAYER_SIZE, GRAVITY, JUMP_FORCE, COIN_SIZE, COIN_VALUE, COSMETICS, SCORE_EVERY_N_FRAMES } from './gameConfig.js'
import { drawPlayer, drawCoin, drawLevelUpText, updateAndDrawParticles, addDeathParticles, addTrailParticle, drawEnvironment } from './renderer.js'
import { playJump, playCoin, playDeath, playLevelUp, setMasterVolume } from './sound.js'
import Shop from './Shop.jsx'
import Settings from './Settings.jsx'

const API = 'http://localhost:3001/api'
const NICK_REGEX = /^[a-zA-Z0-9çğıöşüÇĞİÖŞÜ _-]+$/

function loadData(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback }
  catch { return fallback }
}

function App() {
  // Nick
  const [nickname, setNickname] = useState(() => localStorage.getItem('jumpforever_nick') || '')
  const [nickConfirmed, setNickConfirmed] = useState(() => !!localStorage.getItem('jumpforever_nick'))
  const [nickInput, setNickInput] = useState('')
  const [nickError, setNickError] = useState('')

  // Shop & Settings
  const [showShop, setShowShop] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [coins, setCoins] = useState(() => loadData('jumpforever_coins', 0))
  const [owned, setOwned] = useState(() => loadData('jumpforever_owned', { colors: ['default'], hats: ['none'], glasses: ['none'] }))
  const [equipped, setEquipped] = useState(() => loadData('jumpforever_equipped', { color: 'default', hat: 'none', glasses: 'none' }))

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState([])
  const [leaderboardTab, setLeaderboardTab] = useState('all')

  // Sound
  const [soundOn, setSoundOn] = useState(() => loadData('jumpforever_sound', true))
  const [volume, setVolume] = useState(() => loadData('jumpforever_volume', 0.5))

  // Game
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [canvasWidth, setCanvasWidth] = useState(800)
  const gameState = useRef({
    player: { x: 80, y: GROUND_Y - PLAYER_SIZE, vy: 0, jumping: false },
    obstacles: [],
    coins: [],
    score: 0,
    highScore: 0,
    level: 0,
    spawnTimer: 0,
    coinSpawnTimer: 0,
    running: false,
    gameOver: false,
    frameId: null,
    canvasWidth: 800,
    frame: 0,
    levelUpText: '',
    levelUpAlpha: 0,
    coinsCollected: 0,
  })
  const [display, setDisplay] = useState({ score: 0, highScore: 0, running: false, gameOver: false, level: 1 })
  const [saving, setSaving] = useState(false)

  // Persist data
  useEffect(() => { localStorage.setItem('jumpforever_coins', JSON.stringify(coins)) }, [coins])
  useEffect(() => { localStorage.setItem('jumpforever_owned', JSON.stringify(owned)) }, [owned])
  useEffect(() => { localStorage.setItem('jumpforever_equipped', JSON.stringify(equipped)) }, [equipped])
  useEffect(() => { localStorage.setItem('jumpforever_sound', JSON.stringify(soundOn)) }, [soundOn])
  useEffect(() => { localStorage.setItem('jumpforever_volume', JSON.stringify(volume)); setMasterVolume(volume) }, [volume])

  // Equipped cosmetics
  const equippedColor = COSMETICS.colors.find(c => c.id === equipped.color)?.color || '#818CF8'
  const equippedHat = equipped.hat
  const equippedGlasses = equipped.glasses

  // Responsive canvas
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const w = Math.min(containerRef.current.offsetWidth - 32, 1200)
        setCanvasWidth(w)
        gameState.current.canvasWidth = w
      }
    }
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [nickConfirmed])

  // Leaderboard
  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch(`${API}/scores`)
      setLeaderboard(await res.json())
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { if (nickConfirmed) fetchLeaderboard() }, [nickConfirmed, fetchLeaderboard])

  const getFilteredLeaderboard = () => {
    const now = new Date()
    let filtered = leaderboard
    if (leaderboardTab === 'daily') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      filtered = leaderboard.filter(s => s.date >= today)
    } else if (leaderboardTab === 'weekly') {
      const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString()
      filtered = leaderboard.filter(s => s.date >= weekAgo)
    }
    return filtered.slice(0, 10)
  }

  // Nick
  const submitNick = (e) => {
    e.preventDefault()
    const trimmed = nickInput.trim()
    if (trimmed.length < 2) { setNickError('En az 2 karakter olmalı'); return }
    if (trimmed.length > 20) { setNickError('En fazla 20 karakter olabilir'); return }
    if (!NICK_REGEX.test(trimmed)) { setNickError('Sadece harf, rakam, boşluk, - ve _ kullanılabilir'); return }
    setNickError('')
    setNickname(trimmed)
    setNickConfirmed(true)
    localStorage.setItem('jumpforever_nick', trimmed)
  }

  // Score saving
  const saveScore = useCallback(async (score) => {
    if (saving) return
    setSaving(true)
    try {
      await fetch(`${API}/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nickname, score }),
      })
      await fetchLeaderboard()
    } catch { /* ignore */ }
    setSaving(false)
  }, [nickname, fetchLeaderboard, saving])

  // Game
  const startGame = useCallback(() => {
    const gs = gameState.current
    gs.player = { x: 80, y: GROUND_Y - PLAYER_SIZE, vy: 0, jumping: false }
    gs.obstacles = []
    gs.coins = []
    gs.score = 0
    gs.level = 0
    gs.spawnTimer = 0
    gs.coinSpawnTimer = 0
    gs.running = true
    gs.gameOver = false
    gs.frame = 0
    gs.levelUpText = ''
    gs.levelUpAlpha = 0
    gs.coinsCollected = 0
    setDisplay({ score: 0, highScore: gs.highScore, running: true, gameOver: false, level: 1 })
  }, [])

  const handleGameOver = useCallback((score) => {
    saveScore(score)
  }, [saveScore])

  const jump = useCallback(() => {
    if (showShop || showSettings) return
    const gs = gameState.current
    if (!gs.running && !gs.gameOver) { startGame(); return }
    if (gs.gameOver) { startGame(); return }
    if (!gs.player.jumping) {
      gs.player.vy = JUMP_FORCE
      gs.player.jumping = true
      if (soundOn) playJump()
    }
  }, [startGame, showShop, showSettings, soundOn])

  // Key handlers
  useEffect(() => {
    if (!nickConfirmed) return
    const handleKey = (e) => {
      if (e.code === 'Escape') {
        e.preventDefault()
        if (showShop) { setShowShop(false); return }
        setShowSettings(p => !p)
        return
      }
      if (e.code === 'Space' && !showShop && !showSettings) {
        e.preventDefault()
        jump()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [jump, nickConfirmed, showShop, showSettings])

  // Game loop
  useEffect(() => {
    if (!nickConfirmed) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const loop = () => {
      const gs = gameState.current
      const cw = gs.canvasWidth
      gs.frame++

      // Level
      const prevLevel = gs.level
      for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (gs.score >= LEVELS[i].scoreThreshold) { gs.level = i; break }
      }
      const lvl = LEVELS[gs.level]

      // Level up
      if (gs.level > prevLevel && gs.running) {
        gs.levelUpText = `Level ${gs.level + 1}`
        gs.levelUpAlpha = 1
        if (soundOn) playLevelUp()
      }
      if (gs.levelUpAlpha > 0) gs.levelUpAlpha -= 0.006

      if (gs.running && !gs.gameOver) {
        // Player physics
        gs.player.vy += GRAVITY
        gs.player.y += gs.player.vy
        if (gs.player.y >= GROUND_Y - PLAYER_SIZE) {
          gs.player.y = GROUND_Y - PLAYER_SIZE
          gs.player.vy = 0
          gs.player.jumping = false
        }

        // Trail
        if (gs.frame % 3 === 0) {
          addTrailParticle(gs.player.x, gs.player.y, equippedColor === 'rainbow' ? '#818CF8' : equippedColor)
        }

        // Spawn obstacles
        gs.spawnTimer++
        const currentSpawnInterval = Math.max(lvl.minSpawnInterval, lvl.spawnInterval - (gs.score - lvl.scoreThreshold) * 0.01)
        if (gs.spawnTimer >= currentSpawnInterval) {
          gs.spawnTimer = 0
          const types = lvl.obstacleTypes
          const type = types[Math.floor(Math.random() * types.length)]
          const ot = OBSTACLE_TYPES[type]
          const h = ot.minH + Math.random() * (ot.maxH - ot.minH)
          const obsY = ot.y === 'air' ? GROUND_Y - 80 - Math.random() * 30 : GROUND_Y - h

          gs.obstacles.push({ x: cw, y: obsY, w: ot.w, h, color: ot.color, type })

          if (type === 'double') {
            const h2 = ot.secondMinH + Math.random() * (ot.secondMaxH - ot.secondMinH)
            gs.obstacles.push({ x: cw + ot.gap, y: GROUND_Y - h2, w: ot.secondW, h: h2, color: ot.color, type: 'low' })
          }
        }

        // Spawn coins independently - random timing & position
        gs.coinSpawnTimer++
        const coinInterval = 120 + Math.random() * 60 // random interval
        if (gs.coinSpawnTimer >= coinInterval && Math.random() < lvl.coinChance) {
          gs.coinSpawnTimer = 0
          // Random positions: can be on ground level, mid-air, or high - always reachable
          const positions = [
            { x: cw + Math.random() * 200, y: GROUND_Y - PLAYER_SIZE - 5 },    // ground level (easy)
            { x: cw + 50 + Math.random() * 150, y: GROUND_Y - 60 - Math.random() * 20 }, // low jump
            { x: cw + Math.random() * 200, y: GROUND_Y - 90 - Math.random() * 30 },  // mid air
            { x: cw + 80 + Math.random() * 100, y: GROUND_Y - 50 },  // just above ground
          ]
          const pos = positions[Math.floor(Math.random() * positions.length)]
          gs.coins.push(pos)
        }

        // Move
        const speed = lvl.speed + (gs.score - lvl.scoreThreshold) * 0.0003
        gs.obstacles.forEach(o => { o.x -= speed })
        gs.obstacles = gs.obstacles.filter(o => o.x + o.w > 0)
        gs.coins.forEach(c => { c.x -= speed })
        gs.coins = gs.coins.filter(c => c.x + COIN_SIZE > 0)

        // Coin collision - each coin gives +1 coin currency and +COIN_VALUE score
        const p = gs.player
        for (let i = gs.coins.length - 1; i >= 0; i--) {
          const c = gs.coins[i]
          if (p.x < c.x + COIN_SIZE && p.x + PLAYER_SIZE > c.x && p.y < c.y + COIN_SIZE && p.y + PLAYER_SIZE > c.y) {
            gs.coins.splice(i, 1)
            gs.score += COIN_VALUE
            gs.coinsCollected++
            setCoins(prev => prev + 1)
            if (soundOn) playCoin()
          }
        }

        // Obstacle collision
        for (const o of gs.obstacles) {
          if (p.x + 4 < o.x + o.w && p.x + PLAYER_SIZE - 4 > o.x && p.y + 4 < o.y + o.h && p.y + PLAYER_SIZE - 2 > o.y) {
            gs.gameOver = true
            gs.running = false
            if (gs.score > gs.highScore) gs.highScore = gs.score
            addDeathParticles(p.x, p.y, equippedColor === 'rainbow' ? '#818CF8' : equippedColor)
            if (soundOn) playDeath()
            setDisplay({ score: gs.score, highScore: gs.highScore, running: false, gameOver: true, level: gs.level + 1 })
            handleGameOver(gs.score)
          }
        }

        if (gs.frame % SCORE_EVERY_N_FRAMES === 0) gs.score++

        if (gs.score % 5 === 0) {
          setDisplay({ score: gs.score, highScore: gs.highScore, running: true, gameOver: false, level: gs.level + 1 })
        }
      }

      // --- DRAW ---
      const currentLvl = LEVELS[gs.level]
      ctx.fillStyle = (gs.running || gs.gameOver) ? currentLvl.bgColor : LEVELS[0].bgColor
      ctx.fillRect(0, 0, cw, CANVAS_HEIGHT)

      // Draw themed environment (ground, decorations)
      drawEnvironment(ctx, cw, currentLvl, gs.frame)

      // Particles
      updateAndDrawParticles(ctx)

      // Coins
      gs.coins.forEach(c => drawCoin(ctx, c, gs.frame))

      // Obstacles
      gs.obstacles.forEach(o => {
        ctx.fillStyle = o.color
        ctx.fillRect(o.x, o.y, o.w, o.h)
        ctx.fillStyle = 'rgba(255,255,255,0.15)'
        ctx.fillRect(o.x, o.y, o.w, 3)
      })

      // Player
      const p = gs.player
      drawPlayer(ctx, p.x, p.y, equippedColor, equippedHat, equippedGlasses, gs.frame)

      // BG level indicator
      if (gs.running) {
        ctx.fillStyle = 'rgba(255,255,255,0.03)'
        ctx.font = 'bold 80px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(`LV${gs.level + 1}`, cw / 2, CANVAS_HEIGHT / 2 + 25)
      }

      // Level up text
      if (gs.levelUpAlpha > 0) drawLevelUpText(ctx, cw, gs.levelUpText, gs.levelUpAlpha)

      // Start text
      if (!gs.running && !gs.gameOver) {
        ctx.fillStyle = '#9CA3AF'
        ctx.font = '20px monospace'
        ctx.textAlign = 'center'
        ctx.fillText('BOŞLUK tuşuna bas', cw / 2, CANVAS_HEIGHT / 2)
      }

      // Game over
      if (gs.gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.4)'
        ctx.fillRect(0, 0, cw, CANVAS_HEIGHT)
        ctx.fillStyle = '#EF4444'
        ctx.font = 'bold 36px monospace'
        ctx.textAlign = 'center'
        ctx.fillText('GAME OVER', cw / 2, CANVAS_HEIGHT / 2 - 30)
        ctx.fillStyle = '#9CA3AF'
        ctx.font = '16px monospace'
        ctx.fillText(`Skor: ${gs.score}  |  Level: ${gs.level + 1}  |  ${gs.coinsCollected} coin`, cw / 2, CANVAS_HEIGHT / 2 + 5)
        ctx.fillText('Tekrar için BOŞLUK', cw / 2, CANVAS_HEIGHT / 2 + 30)
      }

      gs.frameId = requestAnimationFrame(loop)
    }

    gameState.current.frameId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(gameState.current.frameId)
  }, [nickConfirmed, handleGameOver, canvasWidth, equippedColor, equippedHat, equippedGlasses, soundOn])

  // Shop handlers
  const handleBuy = (category, itemId, price) => {
    if (coins < price) return
    setCoins(prev => prev - price)
    setOwned(prev => ({ ...prev, [category]: [...(prev[category] || []), itemId] }))
    const key = category.slice(0, -1)
    setEquipped(prev => ({ ...prev, [key]: itemId }))
  }

  const handleEquip = (category, itemId) => {
    const key = category.slice(0, -1)
    setEquipped(prev => ({ ...prev, [key]: itemId }))
  }

  // Share
  const shareText = `JumpForEver'da ${display.score} skor yaptım! Sen de dene!`
  const shareUrl = window.location.origin
  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
  }

  // Nick screen
  if (!nickConfirmed) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <form onSubmit={submitNick} className="bg-gray-800 p-8 rounded-xl shadow-xl w-96 text-center">
          <div className="mb-4">
            <svg viewBox="0 0 64 64" className="w-16 h-16 mx-auto">
              <rect x="8" y="8" width="48" height="48" rx="8" fill="#818CF8"/>
              <rect x="33" y="20" width="10" height="10" rx="2" fill="#fff"/>
              <rect x="37" y="24" width="5" height="5" rx="1" fill="#111"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">JumpForEver</h1>
          <p className="text-gray-400 mb-6">Oynamak için bir nick seç</p>
          <input
            type="text" maxLength={20} placeholder="Nickini gir..." value={nickInput}
            onChange={e => setNickInput(e.target.value)} autoFocus
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 mb-2 outline-none focus:border-indigo-500 text-center text-lg"
          />
          {nickError && <p className="text-red-400 text-sm mb-2">{nickError}</p>}
          <button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 rounded-lg cursor-pointer mt-2 text-lg">
            Oyna
          </button>
        </form>
      </div>
    )
  }

  const filteredLb = getFilteredLeaderboard()
  const anyModalOpen = showShop || showSettings

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col" ref={containerRef}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 64 64" className="w-7 h-7">
            <rect x="8" y="8" width="48" height="48" rx="8" fill="#818CF8"/>
            <rect x="33" y="20" width="10" height="10" rx="2" fill="#fff"/>
            <rect x="37" y="24" width="5" height="5" rx="1" fill="#111"/>
          </svg>
          <h1 className="text-lg font-bold text-white">JumpForEver</h1>
          <span className="text-gray-600 text-sm">Lv.{display.level}</span>
        </div>
        <div className="flex items-center gap-4 font-mono">
          <span className="text-indigo-400">Skor: {display.score}</span>
          <span className="text-yellow-400 text-sm">{coins} coin</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); setShowShop(true) }}
            className="bg-gray-800 hover:bg-gray-700 text-yellow-400 px-3 py-1 rounded text-xs font-semibold cursor-pointer border border-gray-700"
          >
            Mağaza
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setShowSettings(true) }}
            className="bg-gray-800 hover:bg-gray-700 text-gray-400 px-3 py-1 rounded text-xs cursor-pointer border border-gray-700"
          >
            Ayarlar
          </button>
          <span className="text-gray-600 text-sm ml-1">{nickname}</span>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Game */}
        <div className="flex-1 flex items-center justify-center p-4" onClick={anyModalOpen ? undefined : jump}>
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={CANVAS_HEIGHT}
            className="rounded-xl border border-gray-700 shadow-2xl w-full"
            style={{ maxWidth: 1200 }}
          />
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-gray-800 p-4 shrink-0">
          <div className="flex gap-1 mb-3">
            {[
              { key: 'all', label: 'Tüm Zamanlar' },
              { key: 'weekly', label: 'Haftalık' },
              { key: 'daily', label: 'Günlük' },
            ].map(t => (
              <button
                key={t.key}
                onClick={(e) => { e.stopPropagation(); setLeaderboardTab(t.key) }}
                className={`flex-1 text-xs py-1.5 rounded cursor-pointer ${
                  leaderboardTab === t.key ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-800 text-gray-500 hover:text-gray-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="bg-gray-800 rounded-lg overflow-hidden">
            {filteredLb.length === 0 && <p className="text-gray-600 text-center py-6 text-sm">Henüz skor yok</p>}
            {filteredLb.map((s, i) => (
              <div key={s.id} className={`flex items-center px-3 py-2 text-sm ${i % 2 === 0 ? 'bg-gray-800' : 'bg-gray-800/50'}`}>
                <span className={`w-6 font-bold ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-600'}`}>
                  {i + 1}
                </span>
                <span className={`flex-1 truncate ${s.name === nickname ? 'text-indigo-300 font-semibold' : 'text-white'}`}>
                  {s.name}
                </span>
                <span className="text-indigo-400 font-mono ml-2">{s.score}</span>
              </div>
            ))}
          </div>

          {display.gameOver && display.score > 0 && (
            <div className="mt-4" onClick={e => e.stopPropagation()}>
              <p className="text-gray-500 text-xs mb-2 text-center">Skorunu paylaş</p>
              <div className="flex gap-2 justify-center">
                <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer"
                   className="bg-gray-800 hover:bg-gray-700 text-blue-400 px-3 py-1.5 rounded text-xs">Twitter</a>
                <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer"
                   className="bg-gray-800 hover:bg-gray-700 text-blue-500 px-3 py-1.5 rounded text-xs">Facebook</a>
                <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer"
                   className="bg-gray-800 hover:bg-gray-700 text-green-400 px-3 py-1.5 rounded text-xs">WhatsApp</a>
              </div>
            </div>
          )}

          <p className="text-gray-700 text-xs mt-3 text-center">BOŞLUK = Zıpla | ESC = Ayarlar</p>
        </div>
      </div>

      {showShop && <Shop coins={coins} owned={owned} equipped={equipped} onBuy={handleBuy} onEquip={handleEquip} onClose={() => setShowShop(false)} />}
      {showSettings && <Settings soundOn={soundOn} setSoundOn={setSoundOn} volume={volume} setVolume={setVolume} onClose={() => setShowSettings(false)} />}
    </div>
  )
}

export default App
