import { createContext, useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUser, clearUser } from "./store/userSlice";
import { ToastContainer, toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { UserPreferencesProvider } from "./context/UserPreferencesContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import getIcon from "./utils/iconUtils";

// Pages
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Callback from "./pages/Callback";
import ErrorPage from "./pages/ErrorPage";
import Dashboard from "./pages/Dashboard";

// Create auth context
export const AuthContext = createContext(null);

// Component for dark mode toggle
const DarkModeToggle = () => {
  const SunIcon = getIcon("Sun");
  const MoonIcon = getIcon("Moon");

  const [isDarkMode, setIsDarkMode] = useState(
    () =>
      localStorage.getItem("darkMode") === "true" ||
      window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    document.documentElement.classList[isDarkMode ? "add" : "remove"]("dark");
    localStorage.setItem("darkMode", isDarkMode);
  }, [isDarkMode]);

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={() => setIsDarkMode(!isDarkMode)}
      className="fixed bottom-4 right-4 z-40 p-3 rounded-full bg-surface-100 dark:bg-surface-800 shadow-soft dark:shadow-none"
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
          {isDarkMode ? (
            <SunIcon className="w-5 h-5 text-yellow-400" />
          ) : (
            <MoonIcon className="w-5 h-5 text-surface-700" />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
};

function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);
  const [publicKey, setPublicKey] = useState(null);

  // Get authentication status
  const userState = useSelector((state) => state.user);
  const isAuthenticated = userState?.isAuthenticated || false;

  // Initialize ApperUI once when the app loads
  useEffect(() => {
    const { ApperClient, ApperUI } = window.ApperSDK;
    const client = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY,
    });

    setPublicKey(import.meta.env.VITE_APPER_PUBLIC_KEY);

    // Initialize but don't show login yet
    ApperUI.setup(client, {
      target: "#authentication",
      clientId: import.meta.env.VITE_APPER_PROJECT_ID,
      view: "both",
      onSuccess: function (user) {
        // CRITICAL: This exact currentPath logic must be preserved in all implementations
        // DO NOT simplify or modify this pattern as it ensures proper redirection flow
        let currentPath = window.location.pathname + window.location.search;
        let redirectPath = new URLSearchParams(window.location.search).get(
          "redirect"
        );
        const isAuthPage =
          currentPath.includes("/login") ||
          currentPath.includes("/signup") ||
          currentPath.includes("/callback") ||
          currentPath.includes("/error");
        if (user) {
          // User is authenticated
          if (redirectPath) {
            navigate(redirectPath);
          } else if (!isAuthPage) {
            if (
              !currentPath.includes("/login") &&
              !currentPath.includes("/signup")
            ) {
              navigate(currentPath);
            } else {
              navigate("/dashboard");
            }
          } else {
            navigate("/dashboard");
          }
          // Store user information in Redux
          dispatch(setUser(JSON.parse(JSON.stringify(user))));
        } else {
          // User is not authenticated
          if (!isAuthPage) {
            navigate(
              currentPath.includes("/signup")
                ? `/signup?redirect=${currentPath}`
                : currentPath.includes("/login")
                ? `/login?redirect=${currentPath}`
                : "/login"
            );
          } else if (redirectPath) {
            if (
              !["error", "signup", "login", "callback"].some((path) =>
                currentPath.includes(path)
              )
            )
              navigate(`/login?redirect=${redirectPath}`);
            else {
              navigate(currentPath);
            }
          } else if (isAuthPage) {
            navigate(currentPath);
          } else {
            navigate("/login");
          }
          dispatch(clearUser());
        }
      },
      onError: function (error) {
        console.error("Authentication failed:", error);
        toast.error("Authentication failed. Please try again.");
        navigate("/error?message=Authentication failed");
      },
    });

    setIsInitialized(true);
  }, [dispatch, navigate]);

  // Authentication methods to share via context
  const authMethods = {
    isInitialized,
    logout: async () => {
      try {
        const { ApperUI } = window.ApperSDK;
        await ApperUI.logout();
        dispatch(clearUser());
        navigate("/login");
        toast.info("You have been logged out successfully");
      } catch (error) {
        console.error("Logout failed:", error);
        toast.error("Logout failed. Please try again.");
      }
    },
  };

  return (
    <AuthProvider value={authMethods}>
      <UserPreferencesProvider>
        <div className="min-h-screen flex flex-col">
          <p>Public Key: {publicKey}</p>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/callback" element={<Callback />} />
              <Route path="/error" element={<ErrorPage />} />
              <Route
                path="/"
                element={isAuthenticated ? <Dashboard /> : <Home />}
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
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
    </AuthProvider>
  );
}

export default App;
