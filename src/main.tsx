import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("App initializing, SUPABASE_URL exists:", !!import.meta.env.VITE_SUPABASE_URL);

createRoot(document.getElementById("root")!).render(<App />);
