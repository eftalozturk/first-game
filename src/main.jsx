import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import Admin from "./Admin.jsx";

// Vite tarafından üretim için ayarlanan base yolu
// import.meta.env.BASE_URL değeri prod ortamda "/first-game/" olacaktır.
// Geliştirme sırasında hem kök hem de /first-game/ adreslerinde deneme
// yapılabilmesi için pathname’e bakarak baz yolu dinamik seçiyoruz.
let basename = import.meta.env.BASE_URL || "/";
if (import.meta.env.DEV) {
  const path = window.location.pathname || "/";
  basename = path.startsWith("/first-game/") ? "/first-game/" : "/";
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
