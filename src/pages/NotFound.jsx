import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import getIcon from "../utils/iconUtils";

const NotFound = () => {
  const navigate = useNavigate();
  const AlertTriangleIcon = getIcon("AlertTriangle");
  const HomeIcon = getIcon("Home");
  const ArrowLeftIcon = getIcon("ArrowLeft");
  
  // Redirect after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  return (
    <motion.div 
      className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-surface-50 to-surface-200 dark:from-surface-900 dark:to-surface-800"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="max-w-md w-full bg-white dark:bg-surface-800 rounded-2xl shadow-card p-8 text-center"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <motion.div
          initial={{ scale: 0.8, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="mb-6 mx-auto w-max"
        >
          <AlertTriangleIcon className="w-24 h-24 text-accent mx-auto" />
        </motion.div>
        
        <h1 className="text-4xl font-bold mb-2 text-surface-900 dark:text-white">404</h1>
        <h2 className="text-2xl font-semibold mb-4 text-surface-700 dark:text-surface-300">Page Not Found</h2>
        
        <p className="text-surface-600 dark:text-surface-400 mb-8">
          Oops! The page you're looking for does not exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="btn-outline flex items-center justify-center"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Go Back
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            className="btn-primary flex items-center justify-center"
          >
            <HomeIcon className="w-4 h-4 mr-2" />
            Back to Home
          </motion.button>
        </div>
        
        <motion.div 
          className="mt-8 text-sm text-surface-500 dark:text-surface-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Redirecting to home page in 10 seconds...
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default NotFound;