import { COSMETICS } from './gameConfig.js'
import { drawPlayer } from './renderer.js'
import { useRef, useEffect } from 'react'

function PreviewCanvas({ color, hat, glasses }) {
  const ref = useRef(null)
  const frameRef = useRef(0)

  useEffect(() => {
    const ctx = ref.current.getContext('2d')
    let id
    const draw = () => {
      frameRef.current++
      ctx.clearRect(0, 0, 80, 80)
      ctx.fillStyle = '#1f2937'
      ctx.fillRect(0, 0, 80, 80)
      drawPlayer(ctx, 20, 20, color, hat, glasses, frameRef.current)
      id = requestAnimationFrame(draw)
    }
    id = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(id)
  }, [color, hat, glasses])

  return <canvas ref={ref} width={80} height={80} className="rounded-lg" />
}

export default function Shop({ coins, owned, equipped, onBuy, onEquip, onClose }) {
  const tabs = [
    { key: 'colors', label: 'Renkler', items: COSMETICS.colors },
    { key: 'hats', label: 'Şapkalar', items: COSMETICS.hats },
    { key: 'glasses', label: 'Gözlükler', items: COSMETICS.glasses },
  ]

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl w-[480px] max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Mağaza</h2>
          <div className="flex items-center gap-4">
            <span className="text-yellow-400 font-mono font-bold">{coins} coin</span>
            <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer text-xl">✕</button>
          </div>
        </div>

        {/* Preview */}
        <div className="flex justify-center py-4 bg-gray-900/50">
          <PreviewCanvas
            color={COSMETICS.colors.find(c => c.id === equipped.color)?.color || '#818CF8'}
            hat={equipped.hat}
            glasses={equipped.glasses}
          />
        </div>

        {/* Tabs */}
        <div className="overflow-y-auto max-h-[50vh] p-4 space-y-6">
          {tabs.map(tab => (
            <div key={tab.key}>
              <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase">{tab.label}</h3>
              <div className="grid grid-cols-2 gap-2">
                {tab.items.map(item => {
                  const isOwned = owned[tab.key]?.includes(item.id)
                  const isEquipped = equipped[tab.key.slice(0, -1)] === item.id // colors->color, hats->hat
                  const canAfford = coins >= item.price

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        isEquipped
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : 'border-gray-700 bg-gray-700/30'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {tab.key === 'colors' && (
                          <div
                            className="w-5 h-5 rounded"
                            style={{ background: item.color === 'rainbow' ? 'linear-gradient(90deg, red, orange, yellow, green, blue, purple)' : item.color }}
                          />
                        )}
                        <span className="text-white text-sm">{item.name}</span>
                      </div>
                      <div>
                        {isEquipped ? (
                          <span className="text-indigo-400 text-xs font-semibold">Aktif</span>
                        ) : isOwned || item.price === 0 ? (
                          <button
                            onClick={() => onEquip(tab.key, item.id)}
                            className="text-xs bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded cursor-pointer"
                          >
                            Seç
                          </button>
                        ) : (
                          <button
                            onClick={() => canAfford && onBuy(tab.key, item.id, item.price)}
                            className={`text-xs px-3 py-1 rounded cursor-pointer ${
                              canAfford
                                ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
                                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            }`}
                            disabled={!canAfford}
                          >
                            {item.price} coin
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
