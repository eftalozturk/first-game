import { PLAYER_SIZE, COIN_SIZE, GROUND_Y, CANVAS_HEIGHT } from './gameConfig.js'

// Particle pool for performance
const particles = []
const MAX_PARTICLES = 50

export function addDeathParticles(x, y, color) {
  for (let i = 0; i < 12; i++) {
    if (particles.length >= MAX_PARTICLES) particles.shift()
    particles.push({
      x: x + PLAYER_SIZE / 2,
      y: y + PLAYER_SIZE / 2,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      life: 1,
      size: 3 + Math.random() * 5,
      color,
    })
  }
}

export function addTrailParticle(x, y, color) {
  if (particles.length >= MAX_PARTICLES) particles.shift()
  particles.push({
    x: x + 5,
    y: y + PLAYER_SIZE - 4,
    vx: -0.5 + Math.random() * -1,
    vy: (Math.random() - 0.5) * 0.5,
    life: 0.6,
    size: 2 + Math.random() * 3,
    color,
  })
}

export function updateAndDrawParticles(ctx) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.x += p.vx
    p.y += p.vy
    p.life -= 0.025
    if (p.life <= 0) {
      particles.splice(i, 1)
      continue
    }
    ctx.globalAlpha = p.life
    ctx.fillStyle = p.color
    ctx.fillRect(p.x, p.y, p.size * p.life, p.size * p.life)
  }
  ctx.globalAlpha = 1
}

// Rainbow color cycle
function getRainbowColor(frame) {
  const r = Math.sin(frame * 0.02) * 127 + 128
  const g = Math.sin(frame * 0.02 + 2) * 127 + 128
  const b = Math.sin(frame * 0.02 + 4) * 127 + 128
  return `rgb(${r|0},${g|0},${b|0})`
}

export function getPlayerColor(colorId, frame) {
  if (colorId === 'rainbow') return getRainbowColor(frame)
  return colorId
}

export function drawPlayer(ctx, x, y, color, hat, glasses, frame) {
  const actualColor = getPlayerColor(color, frame)

  ctx.fillStyle = actualColor
  ctx.fillRect(x, y, PLAYER_SIZE, PLAYER_SIZE)

  // Eye
  ctx.fillStyle = '#fff'
  ctx.fillRect(x + 25, y + 12, 10, 10)
  ctx.fillStyle = '#111'
  ctx.fillRect(x + 29, y + 15, 5, 5)

  drawHat(ctx, x, y, hat)
  drawGlasses(ctx, x, y, glasses)
}

function drawHat(ctx, x, y, hatId) {
  switch (hatId) {
    case 'tophat':
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(x + 5, y - 20, 30, 20)
      ctx.fillRect(x, y - 4, PLAYER_SIZE, 6)
      break
    case 'crown':
      ctx.fillStyle = '#F59E0B'
      ctx.fillRect(x + 5, y - 12, 30, 12)
      ctx.fillRect(x + 5, y - 18, 6, 6)
      ctx.fillRect(x + 17, y - 18, 6, 6)
      ctx.fillRect(x + 29, y - 18, 6, 6)
      ctx.fillStyle = '#EF4444'
      ctx.fillRect(x + 14, y - 8, 4, 4)
      ctx.fillStyle = '#3B82F6'
      ctx.fillRect(x + 22, y - 8, 4, 4)
      break
    case 'cap':
      ctx.fillStyle = '#3B82F6'
      ctx.fillRect(x + 2, y - 8, 36, 10)
      ctx.fillRect(x + 28, y - 4, 16, 5)
      break
    case 'beanie':
      ctx.fillStyle = '#EF4444'
      ctx.fillRect(x + 5, y - 10, 30, 12)
      ctx.beginPath()
      ctx.arc(x + 20, y - 12, 4, 0, Math.PI * 2)
      ctx.fillStyle = '#fff'
      ctx.fill()
      break
    case 'antenna':
      ctx.strokeStyle = '#9CA3AF'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(x + 20, y)
      ctx.lineTo(x + 20, y - 18)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(x + 20, y - 20, 4, 0, Math.PI * 2)
      ctx.fillStyle = '#EF4444'
      ctx.fill()
      break
  }
}

function drawGlasses(ctx, x, y, glassesId) {
  switch (glassesId) {
    case 'sunglasses':
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(x + 18, y + 12, 20, 8)
      ctx.fillRect(x + 14, y + 14, 4, 2)
      break
    case 'nerd':
      ctx.strokeStyle = '#1a1a2e'
      ctx.lineWidth = 2
      ctx.strokeRect(x + 20, y + 10, 14, 12)
      ctx.fillStyle = 'rgba(200,200,255,0.3)'
      ctx.fillRect(x + 21, y + 11, 12, 10)
      break
    case 'monocle':
      ctx.strokeStyle = '#F59E0B'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(x + 30, y + 17, 8, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(x + 30, y + 25)
      ctx.lineTo(x + 28, y + 38)
      ctx.stroke()
      break
    case 'vr':
      ctx.fillStyle = '#374151'
      ctx.fillRect(x + 14, y + 8, 26, 14)
      ctx.fillStyle = '#06B6D4'
      ctx.fillRect(x + 16, y + 10, 10, 10)
      ctx.fillRect(x + 28, y + 10, 10, 10)
      break
  }
}

export function drawCoin(ctx, coin, frame) {
  const pulse = Math.sin(frame * 0.1) * 2
  ctx.fillStyle = '#F59E0B'
  ctx.beginPath()
  ctx.arc(coin.x + COIN_SIZE / 2, coin.y + COIN_SIZE / 2, COIN_SIZE / 2 + pulse, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#92400E'
  ctx.font = 'bold 10px monospace'
  ctx.textAlign = 'center'
  ctx.fillText('$', coin.x + COIN_SIZE / 2, coin.y + COIN_SIZE / 2 + 4)
}

export function drawLevelUpText(ctx, cw, text, alpha) {
  ctx.globalAlpha = alpha
  ctx.fillStyle = '#F59E0B'
  ctx.font = 'bold 48px monospace'
  ctx.textAlign = 'center'
  ctx.fillText(text, cw / 2, 120)
  ctx.globalAlpha = 1
}

// Draw themed environment for each level
export function drawEnvironment(ctx, cw, level, frame) {
  const theme = level.theme
  const gy = GROUND_Y

  // Ground base
  ctx.fillStyle = level.groundColor
  ctx.fillRect(0, gy, cw, CANVAS_HEIGHT - gy)

  // Ground top line
  ctx.fillStyle = level.groundAccent
  ctx.fillRect(0, gy, cw, 3)

  // Theme-specific decorations
  switch (theme) {
    case 'grass': {
      // Grass blades
      ctx.fillStyle = '#3d7a37'
      for (let gx = (frame * -1.5) % 30; gx < cw; gx += 30) {
        ctx.fillRect(gx, gy - 4, 2, 6)
        ctx.fillRect(gx + 12, gy - 3, 2, 5)
      }
      // Distant hills
      ctx.fillStyle = 'rgba(45, 90, 39, 0.3)'
      for (let hx = (frame * -0.3) % 200; hx < cw + 200; hx += 200) {
        ctx.beginPath()
        ctx.arc(hx, gy, 50, Math.PI, 0)
        ctx.fill()
      }
      break
    }
    case 'forest': {
      // Trees in background
      ctx.fillStyle = 'rgba(30, 60, 25, 0.4)'
      for (let tx = (frame * -0.5) % 120; tx < cw + 120; tx += 120) {
        ctx.fillRect(tx + 10, gy - 50, 8, 50)
        ctx.beginPath()
        ctx.moveTo(tx - 5, gy - 40)
        ctx.lineTo(tx + 14, gy - 80)
        ctx.lineTo(tx + 33, gy - 40)
        ctx.fill()
      }
      // Ground detail
      ctx.fillStyle = level.groundAccent
      for (let gx = (frame * -2) % 25; gx < cw; gx += 25) {
        ctx.fillRect(gx, gy + 8, 3, 2)
      }
      break
    }
    case 'desert': {
      // Sand dunes in background
      ctx.fillStyle = 'rgba(139, 115, 85, 0.25)'
      for (let dx = (frame * -0.4) % 250; dx < cw + 250; dx += 250) {
        ctx.beginPath()
        ctx.arc(dx, gy, 40, Math.PI, 0)
        ctx.fill()
      }
      // Cactus silhouettes
      ctx.fillStyle = 'rgba(80, 100, 50, 0.3)'
      for (let cx = (frame * -0.6) % 300; cx < cw + 300; cx += 300) {
        ctx.fillRect(cx, gy - 30, 6, 30)
        ctx.fillRect(cx - 8, gy - 22, 8, 4)
        ctx.fillRect(cx - 8, gy - 22, 4, 10)
        ctx.fillRect(cx + 6, gy - 18, 8, 4)
        ctx.fillRect(cx + 10, gy - 18, 4, 10)
      }
      // Ground dots
      ctx.fillStyle = level.groundAccent
      for (let gx = (frame * -2) % 20; gx < cw; gx += 20) {
        ctx.fillRect(gx, gy + 10, 2, 2)
      }
      break
    }
    case 'city': {
      // Buildings in background
      ctx.fillStyle = 'rgba(60, 60, 80, 0.3)'
      const buildings = [40, 70, 55, 90, 50, 75, 60, 85]
      for (let bx = (frame * -0.3) % 400; bx < cw + 400; bx += 50) {
        const h = buildings[Math.abs(Math.floor(bx / 50)) % buildings.length]
        ctx.fillRect(bx, gy - h, 35, h)
        // Windows
        ctx.fillStyle = 'rgba(200, 200, 100, 0.15)'
        for (let wy = gy - h + 8; wy < gy - 5; wy += 12) {
          ctx.fillRect(bx + 8, wy, 6, 6)
          ctx.fillRect(bx + 20, wy, 6, 6)
        }
        ctx.fillStyle = 'rgba(60, 60, 80, 0.3)'
      }
      // Road markings
      ctx.fillStyle = '#5a5a6a'
      for (let rx = (frame * -3) % 60; rx < cw; rx += 60) {
        ctx.fillRect(rx, gy + 15, 20, 3)
      }
      break
    }
    case 'night_city': {
      // Dark buildings
      ctx.fillStyle = 'rgba(30, 30, 50, 0.5)'
      const blds = [60, 90, 45, 100, 70, 55, 80, 65]
      for (let bx = (frame * -0.25) % 400; bx < cw + 400; bx += 50) {
        const h = blds[Math.abs(Math.floor(bx / 50)) % blds.length]
        ctx.fillRect(bx, gy - h, 35, h)
        // Lit windows
        ctx.fillStyle = 'rgba(255, 200, 50, 0.2)'
        for (let wy = gy - h + 8; wy < gy - 5; wy += 14) {
          if (Math.sin(bx + wy) > 0) ctx.fillRect(bx + 8, wy, 5, 5)
          if (Math.cos(bx + wy) > 0) ctx.fillRect(bx + 22, wy, 5, 5)
        }
        ctx.fillStyle = 'rgba(30, 30, 50, 0.5)'
      }
      // Stars
      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      for (let sx = 30; sx < cw; sx += 80) {
        ctx.fillRect(sx, 20 + (sx * 7) % 60, 2, 2)
      }
      break
    }
    case 'cave': {
      // Stalactites
      ctx.fillStyle = 'rgba(80, 60, 45, 0.4)'
      for (let sx = (frame * -0.5) % 100; sx < cw + 100; sx += 100) {
        const h = 15 + (sx * 3) % 25
        ctx.beginPath()
        ctx.moveTo(sx, 0)
        ctx.lineTo(sx + 8, h)
        ctx.lineTo(sx + 16, 0)
        ctx.fill()
      }
      // Rocks on ground
      ctx.fillStyle = level.groundAccent
      for (let rx = (frame * -1.5) % 70; rx < cw; rx += 70) {
        ctx.beginPath()
        ctx.arc(rx, gy + 10, 6, Math.PI, 0)
        ctx.fill()
      }
      break
    }
    case 'ice': {
      // Ice crystals
      ctx.fillStyle = 'rgba(100, 180, 220, 0.15)'
      for (let ix = (frame * -0.4) % 150; ix < cw + 150; ix += 150) {
        ctx.fillRect(ix, gy - 35, 4, 35)
        ctx.fillRect(ix - 6, gy - 25, 16, 4)
      }
      // Snow on ground
      ctx.fillStyle = 'rgba(200, 220, 240, 0.2)'
      for (let sx = (frame * -1) % 40; sx < cw; sx += 40) {
        ctx.beginPath()
        ctx.arc(sx, gy + 3, 5, Math.PI, 0)
        ctx.fill()
      }
      break
    }
    case 'volcano': {
      // Lava glow at bottom
      ctx.fillStyle = 'rgba(200, 50, 10, 0.15)'
      ctx.fillRect(0, gy + 20, cw, CANVAS_HEIGHT - gy - 20)
      // Lava bubbles
      ctx.fillStyle = 'rgba(255, 100, 20, 0.3)'
      for (let lx = (frame * -1) % 80; lx < cw; lx += 80) {
        const bobY = Math.sin(frame * 0.05 + lx) * 3
        ctx.beginPath()
        ctx.arc(lx, gy + 25 + bobY, 4, 0, Math.PI * 2)
        ctx.fill()
      }
      // Smoke
      ctx.fillStyle = 'rgba(100, 50, 30, 0.15)'
      for (let sx = (frame * -0.6) % 200; sx < cw + 200; sx += 200) {
        const smokeY = gy - 40 - Math.sin(frame * 0.02 + sx) * 10
        ctx.beginPath()
        ctx.arc(sx, smokeY, 15, 0, Math.PI * 2)
        ctx.fill()
      }
      break
    }
    case 'space': {
      // Stars
      ctx.fillStyle = 'rgba(255,255,255,0.4)'
      for (let sx = 20; sx < cw; sx += 50) {
        const sy = 10 + (sx * 13) % (gy - 20)
        const blink = Math.sin(frame * 0.03 + sx) > 0.3 ? 1 : 0.3
        ctx.globalAlpha = blink * 0.4
        ctx.fillRect(sx, sy, 2, 2)
      }
      ctx.globalAlpha = 1
      // Asteroid belt on ground
      ctx.fillStyle = level.groundAccent
      for (let ax = (frame * -2) % 50; ax < cw; ax += 50) {
        ctx.fillRect(ax, gy + 5, 8, 4)
        ctx.fillRect(ax + 15, gy + 10, 5, 3)
      }
      break
    }
    case 'hell': {
      // Fire glow
      ctx.fillStyle = 'rgba(200, 30, 0, 0.1)'
      ctx.fillRect(0, 0, cw, CANVAS_HEIGHT)
      // Flames at bottom
      ctx.fillStyle = 'rgba(255, 80, 0, 0.3)'
      for (let fx = (frame * -2) % 40; fx < cw; fx += 40) {
        const fh = 10 + Math.sin(frame * 0.1 + fx * 0.3) * 8
        ctx.beginPath()
        ctx.moveTo(fx, gy + 30)
        ctx.lineTo(fx + 8, gy + 30 - fh)
        ctx.lineTo(fx + 16, gy + 30)
        ctx.fill()
      }
      // Embers floating up
      ctx.fillStyle = 'rgba(255, 150, 0, 0.4)'
      for (let ex = 30; ex < cw; ex += 90) {
        const ey = gy - 20 - ((frame * 0.5 + ex) % 100)
        ctx.fillRect(ex, ey, 2, 2)
      }
      // Cracks in ground
      ctx.strokeStyle = 'rgba(255, 60, 0, 0.3)'
      ctx.lineWidth = 1
      for (let cx = (frame * -1) % 120; cx < cw; cx += 120) {
        ctx.beginPath()
        ctx.moveTo(cx, gy + 5)
        ctx.lineTo(cx + 15, gy + 15)
        ctx.lineTo(cx + 30, gy + 8)
        ctx.stroke()
      }
      break
    }
  }
}
