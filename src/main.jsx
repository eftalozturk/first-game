import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import Admin from "./Admin.jsx";

// Vite tarafından üretim için ayarlanan base yolu
// import.meta.env.BASE_URL değeri prod ortamda "/first-game/" olacaktır.
// Geliştirme sırasında kullanıcı yanlışlıkla /first-game/ adresine
// giderse uyarıyı kapatmak için mevcut path’i de göz önüne alıyoruz.
let basename = import.meta.env.BASE_URL || "/";
if (import.meta.env.DEV) {
  // dev sunucusu bazen "/" olduğundan, projeyi test ederken
  // /first-game/ adresine de izin vermek istiyoruz.
  basename = "/first-game/";
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<Admin />} />
        {/* hiçbir eşleşme olmadığında ana sayfayı göstererek
            konsolda hata mesajını engelle */}
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
