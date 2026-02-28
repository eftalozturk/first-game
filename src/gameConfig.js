// Level configurations (1-10)
// Level 10 = cehennem
export const LEVELS = [
  { // Level 1 - Çayır (Yeşil, rahat)
    speed: 2.2,
    spawnInterval: 200,
    minSpawnInterval: 170,
    obstacleTypes: ['low'],
    coinChance: 0.25,
    bgColor: '#1a2a1a',
    groundColor: '#2d5a27',
    groundAccent: '#3d7a37',
    theme: 'grass',
    scoreThreshold: 0,
  },
  { // Level 2 - Orman
    speed: 2.6,
    spawnInterval: 185,
    minSpawnInterval: 155,
    obstacleTypes: ['low', 'medium'],
    coinChance: 0.22,
    bgColor: '#162216',
    groundColor: '#2a4a24',
    groundAccent: '#3a6a34',
    theme: 'forest',
    scoreThreshold: 2500,
  },
  { // Level 3 - Çöl
    speed: 3.0,
    spawnInterval: 170,
    minSpawnInterval: 140,
    obstacleTypes: ['low', 'medium'],
    coinChance: 0.2,
    bgColor: '#2a2218',
    groundColor: '#8B7355',
    groundAccent: '#A0896A',
    theme: 'desert',
    scoreThreshold: 6000,
  },
  { // Level 4 - Şehir (flying başlıyor)
    speed: 3.3,
    spawnInterval: 158,
    minSpawnInterval: 128,
    obstacleTypes: ['low', 'medium', 'flying'],
    coinChance: 0.18,
    bgColor: '#1a1a2a',
    groundColor: '#4a4a5a',
    groundAccent: '#5a5a6a',
    theme: 'city',
    scoreThreshold: 10000,
  },
  { // Level 5 - Gece Şehri
    speed: 3.6,
    spawnInterval: 148,
    minSpawnInterval: 118,
    obstacleTypes: ['low', 'medium', 'flying'],
    coinChance: 0.16,
    bgColor: '#0f0f1f',
    groundColor: '#3a3a4a',
    groundAccent: '#4a4a5a',
    theme: 'night_city',
    scoreThreshold: 16000,
  },
  { // Level 6 - Mağara
    speed: 3.9,
    spawnInterval: 138,
    minSpawnInterval: 108,
    obstacleTypes: ['low', 'medium', 'tall', 'flying'],
    coinChance: 0.14,
    bgColor: '#12100e',
    groundColor: '#4a3a2a',
    groundAccent: '#5a4a3a',
    theme: 'cave',
    scoreThreshold: 24000,
  },
  { // Level 7 - Buz
    speed: 4.2,
    spawnInterval: 130,
    minSpawnInterval: 100,
    obstacleTypes: ['low', 'medium', 'tall', 'flying'],
    coinChance: 0.12,
    bgColor: '#0e1520',
    groundColor: '#5a7a8a',
    groundAccent: '#6a8a9a',
    theme: 'ice',
    scoreThreshold: 33000,
  },
  { // Level 8 - Volkan
    speed: 4.5,
    spawnInterval: 122,
    minSpawnInterval: 92,
    obstacleTypes: ['low', 'medium', 'tall', 'flying', 'double'],
    coinChance: 0.1,
    bgColor: '#1a0a0a',
    groundColor: '#5a2a1a',
    groundAccent: '#7a3a2a',
    theme: 'volcano',
    scoreThreshold: 43000,
  },
  { // Level 9 - Uzay
    speed: 4.8,
    spawnInterval: 115,
    minSpawnInterval: 85,
    obstacleTypes: ['low', 'medium', 'tall', 'flying', 'double'],
    coinChance: 0.08,
    bgColor: '#06060e',
    groundColor: '#3a3a5a',
    groundAccent: '#4a4a6a',
    theme: 'space',
    scoreThreshold: 55000,
  },
  { // Level 10 - Cehennem
    speed: 5.3,
    spawnInterval: 105,
    minSpawnInterval: 75,
    obstacleTypes: ['low', 'medium', 'tall', 'flying', 'double'],
    coinChance: 0.06,
    bgColor: '#150505',
    groundColor: '#6a1a0a',
    groundAccent: '#8a2a1a',
    theme: 'hell',
    scoreThreshold: 70000,
  },
]

// Obstacle type definitions
export const OBSTACLE_TYPES = {
  low:    { minH: 20, maxH: 30, w: 22, y: 'ground', color: '#EF4444' },
  medium: { minH: 35, maxH: 50, w: 25, y: 'ground', color: '#F97316' },
  tall:   { minH: 55, maxH: 70, w: 20, y: 'ground', color: '#DC2626' },
  flying: { minH: 20, maxH: 25, w: 30, y: 'air',    color: '#A855F7' },
  double: { minH: 25, maxH: 35, w: 22, y: 'ground', color: '#EF4444', gap: 60, secondW: 22, secondMinH: 20, secondMaxH: 30 },
}

// Cosmetic items - prices balanced for slow coin economy
export const COSMETICS = {
  colors: [
    { id: 'default',  name: 'Klasik',       color: '#818CF8', price: 0 },
    { id: 'red',      name: 'Ateş',         color: '#EF4444', price: 30 },
    { id: 'green',    name: 'Zümrüt',       color: '#10B981', price: 30 },
    { id: 'yellow',   name: 'Altın',        color: '#F59E0B', price: 50 },
    { id: 'pink',     name: 'Pembe',        color: '#EC4899', price: 50 },
    { id: 'cyan',     name: 'Buz',          color: '#06B6D4', price: 75 },
    { id: 'orange',   name: 'Turuncu',      color: '#F97316', price: 75 },
    { id: 'lime',     name: 'Neon',         color: '#84CC16', price: 100 },
    { id: 'white',    name: 'Hayalet',      color: '#E5E7EB', price: 150 },
    { id: 'rainbow',  name: 'Gökkuşağı',    color: 'rainbow',  price: 500 },
  ],
  hats: [
    { id: 'none',      name: 'Yok',          price: 0 },
    { id: 'cap',       name: 'Şapka',        price: 40 },
    { id: 'beanie',    name: 'Bere',         price: 60 },
    { id: 'tophat',    name: 'Silindir',     price: 120 },
    { id: 'antenna',   name: 'Anten',        price: 200 },
    { id: 'crown',     name: 'Taç',          price: 400 },
  ],
  glasses: [
    { id: 'none',      name: 'Yok',          price: 0 },
    { id: 'sunglasses',name: 'Güneş Gözlüğü', price: 50 },
    { id: 'nerd',      name: 'Nerd',         price: 80 },
    { id: 'monocle',   name: 'Monokel',      price: 150 },
    { id: 'vr',        name: 'VR Gözlük',    price: 350 },
  ],
}

// Physics
export const CANVAS_HEIGHT = 300
export const GROUND_Y = 250
export const PLAYER_SIZE = 40
export const GRAVITY = 0.45
export const JUMP_FORCE = -12
export const COIN_SIZE = 16
export const COIN_VALUE = 10
export const COIN_EARN_RATE = 0 // no bonus coins from score
export const SCORE_EVERY_N_FRAMES = 2 // score +1 every 2 frames (half speed)
