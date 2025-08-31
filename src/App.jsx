import { Route, Routes, NavLink, useLocation } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Room from "./pages/Room.jsx";
import { useEffect, useState } from "react";
import { Sun, MoonStar, Keyboard } from "lucide-react";
import { Button } from "./components/ui/button.jsx";

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-[rgb(11,16,32)] text-foreground bg-spotlight">
      <nav className="sticky top-0 z-20 backdrop-blur bg-[rgba(11,16,32,0.6)] border-b border-border">
        <div className="container flex h-14 items-center gap-2">
          <div className="flex items-center gap-2 font-semibold">
            <Keyboard className="h-5 w-5" /> Typing Race
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-1">
            <NavLink to="/" className={({isActive}) => `px-3 py-1.5 rounded-md ${isActive ? "bg-card" : "hover:bg-card/60"}`}>Home</NavLink>
            <NavLink to="/room" className={({isActive}) => `px-3 py-1.5 rounded-md ${isActive ? "bg-card" : "hover:bg-card/60"}`}>Room</NavLink>
            <Button variant="ghost" size="icon" onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="h-5 w-5"/> : <MoonStar className="h-5 w-5"/>}
            </Button>
          </div>
        </div>
      </nav>

      <main className="container py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room" element={<Room key={location.key} />} />
        </Routes>
      </main>

      <footer className="container py-10 text-sm opacity-70">
        Pro tip: clean keystrokes first. Speed follows accuracy.
      </footer>
    </div>
  );
}
