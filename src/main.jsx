import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import Admin from "./Admin.jsx";

// Vite tarafından build sırasında ayarlanan base yolu
// import.meta.env.BASE_URL değeri "/first-game/" olacaktır.
const basename = import.meta.env.BASE_URL || "/";

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
