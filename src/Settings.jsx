export default function Settings({ soundOn, setSoundOn, volume, setVolume, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl w-80 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Ayarlar</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer text-xl">✕</button>
        </div>

        {/* Sound toggle */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-300">Ses</span>
          <button
            onClick={() => setSoundOn(p => !p)}
            className={`w-12 h-6 rounded-full cursor-pointer transition-colors relative ${soundOn ? 'bg-indigo-500' : 'bg-gray-600'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${soundOn ? 'left-6' : 'left-0.5'}`} />
          </button>
        </div>

        {/* Volume slider */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">Ses Seviyesi</span>
            <span className="text-gray-500 text-sm">{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(volume * 100)}
            onChange={e => setVolume(Number(e.target.value) / 100)}
            disabled={!soundOn}
            className="w-full accent-indigo-500"
          />
        </div>

        {/* Keybinds info */}
        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Kısayollar</h3>
          <div className="space-y-1 text-sm text-gray-500">
            <div className="flex justify-between">
              <span>Zıpla</span>
              <span className="text-gray-400">BOŞLUK / Tıklama</span>
            </div>
            <div className="flex justify-between">
              <span>Ayarlar</span>
              <span className="text-gray-400">ESC</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg cursor-pointer"
        >
          Kapat
        </button>
      </div>
    </div>
  )
}
