import { useState, useEffect, useCallback } from 'react'

const API = 'http://localhost:3001/api'

// Safe text rendering - never use dangerouslySetInnerHTML
function SafeText({ children }) {
  return <>{String(children)}</>
}

function Admin() {
  const [token, setToken] = useState(() => sessionStorage.getItem('adminToken') || '')
  const [loggedIn, setLoggedIn] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [scores, setScores] = useState([])
  const [filter, setFilter] = useState('')

  // Verify existing token on mount
  useEffect(() => {
    if (token) {
      // Try a protected request to verify token is still valid
      fetch(`${API}/scores`)
        .then(res => res.ok && setLoggedIn(true))
        .catch(() => {
          sessionStorage.removeItem('adminToken')
          setToken('')
        })
    }
  }, [token])

  const fetchScores = useCallback(async () => {
    try {
      const res = await fetch(`${API}/scores`)
      if (res.ok) setScores(await res.json())
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    if (loggedIn) fetchScores()
  }, [loggedIn, fetchScores])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch(`${API}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (res.ok && data.token) {
        setToken(data.token)
        setLoggedIn(true)
        setPassword('')
        sessionStorage.setItem('adminToken', data.token)
      } else {
        setError(data.error || 'Giriş başarısız')
      }
    } catch {
      setError('Sunucuya bağlanılamadı')
    }
  }

  const handleLogout = () => {
    setLoggedIn(false)
    setToken('')
    setPassword('')
    sessionStorage.removeItem('adminToken')
  }

  const deleteScore = async (id) => {
    if (!confirm('Bu skoru silmek istediğine emin misin?')) return
    try {
      const res = await fetch(`${API}/scores/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 401) {
        handleLogout()
        setError('Oturum süresi doldu, tekrar giriş yap')
        return
      }
      fetchScores()
    } catch { /* ignore */ }
  }

  const deleteUserScores = async (name) => {
    if (!confirm(`"${name}" kullanıcısının tüm skorlarını silmek istediğine emin misin?`)) return
    try {
      const res = await fetch(`${API}/scores/user/${encodeURIComponent(name)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 401) {
        handleLogout()
        setError('Oturum süresi doldu, tekrar giriş yap')
        return
      }
      fetchScores()
    } catch { /* ignore */ }
  }

  // Group scores by user for stats
  const userStats = scores.reduce((acc, s) => {
    if (!acc[s.name]) acc[s.name] = { count: 0, best: 0 }
    acc[s.name].count++
    if (s.score > acc[s.name].best) acc[s.name].best = s.score
    return acc
  }, {})

  const filteredScores = filter
    ? scores.filter(s => s.name.toLowerCase().includes(filter.toLowerCase()))
    : scores

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded-xl shadow-xl w-80">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">JumpForEver - Admin</h1>
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 mb-4 outline-none focus:border-indigo-500"
          />
          {error && <p className="text-red-400 text-sm mb-4"><SafeText>{error}</SafeText></p>}
          <button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 rounded-lg cursor-pointer"
          >
            Giriş
          </button>
          <a href="/" className="block text-center text-gray-500 hover:text-gray-300 mt-4 text-sm">
            Oyuna dön
          </a>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Admin Paneli</h1>
          <div className="flex gap-3 items-center">
            <a href="/" className="text-gray-400 hover:text-white text-sm">Oyuna dön</a>
            <button
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 text-sm cursor-pointer"
            >
              Çıkış
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-indigo-400">{scores.length}</p>
            <p className="text-gray-500 text-sm">Toplam Skor</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{Object.keys(userStats).length}</p>
            <p className="text-gray-500 text-sm">Oyuncu</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{scores.length > 0 ? scores[0].score : 0}</p>
            <p className="text-gray-500 text-sm">En Yüksek Skor</p>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Oyuncu ara..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            maxLength={20}
            className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 w-64 outline-none focus:border-indigo-500"
          />
        </div>

        {/* Scores table */}
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          <div className="grid grid-cols-[40px_1fr_80px_140px_100px] gap-2 px-4 py-3 bg-gray-700 text-gray-300 text-sm font-semibold">
            <span>#</span>
            <span>Oyuncu</span>
            <span>Skor</span>
            <span>Tarih</span>
            <span>İşlem</span>
          </div>
          {filteredScores.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              {filter ? 'Sonuç bulunamadı' : 'Henüz skor yok'}
            </p>
          )}
          {filteredScores.map((s, i) => (
            <div
              key={s.id}
              className={`grid grid-cols-[40px_1fr_80px_140px_100px] gap-2 px-4 py-2 items-center text-sm ${i % 2 === 0 ? 'bg-gray-800' : 'bg-gray-800/50'}`}
            >
              <span className="text-gray-500">{i + 1}</span>
              <span className="text-white"><SafeText>{s.name}</SafeText></span>
              <span className="text-indigo-400 font-mono">{Number(s.score)}</span>
              <span className="text-gray-500 text-xs">{new Date(s.date).toLocaleString('tr-TR')}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => deleteScore(s.id)}
                  className="text-red-400 hover:text-red-300 cursor-pointer text-xs"
                >
                  Sil
                </button>
                <button
                  onClick={() => deleteUserScores(s.name)}
                  className="text-orange-400 hover:text-orange-300 cursor-pointer text-xs"
                >
                  Tümünü sil
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-gray-600 text-sm mt-4 text-center">
          Kişi başı maks. 10 skor kaydedilir
        </p>
      </div>
    </div>
  )
}

export default Admin
