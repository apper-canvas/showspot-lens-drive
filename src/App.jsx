import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { UserPreferencesProvider } from "./context/UserPreferencesContext";
import getIcon from "./utils/iconUtils";

// Pages
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

// Component for dark mode toggle
const DarkModeToggle = () => {
  const SunIcon = getIcon("Sun");
  const MoonIcon = getIcon("Moon");
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true" || 
      window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", isDarkMode);
  }, [isDarkMode]);
  
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={() => setIsDarkMode(!isDarkMode)}
      className="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-surface-100 dark:bg-surface-800 shadow-soft dark:shadow-none"
      aria-label="Toggle dark mode"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDarkMode ? "dark" : "light"}
          initial={{ opacity: 0, rotate: -90 }}
          animate={{ opacity: 1, rotate: 0 }}
          exit={{ opacity: 0, rotate: 90 }}
          transition={{ duration: 0.2 }}
        >
          {isDarkMode ? <SunIcon className="w-5 h-5 text-yellow-400" /> : <MoonIcon className="w-5 h-5 text-surface-700" />}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
};

function App() {
  return (
    <UserPreferencesProvider>
      <div className="min-h-screen flex flex-col">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
        
        <DarkModeToggle />
        
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          toastClassName="!bg-surface-100 !text-surface-800 dark:!bg-surface-800 dark:!text-surface-100 shadow-soft"
        />
      </div>
    </UserPreferencesProvider>
  );
}

export default App;