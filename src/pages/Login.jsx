import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from "framer-motion";
import getIcon from "../utils/iconUtils";

const SparklesIcon = getIcon("Sparkles");

function Login() {
  const navigate = useNavigate();
  const { isInitialized } = useAuth();

  useEffect(() => {
    if (isInitialized) {
      // Show login UI in this component
      const { ApperUI } = window.ApperSDK;
      ApperUI.showLogin("#authentication");
    }
  }, [isInitialized]);

  return (
    <div className="flex min-h-screen flex-col justify-center bg-surface-50 dark:bg-surface-900">
      <div className="mx-auto w-full max-w-md px-4 py-8 sm:px-0">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <div className="flex justify-center items-center mb-4">
            <SparklesIcon className="w-8 h-8 text-primary mr-2" />
            <h1 className="text-3xl font-bold text-primary">spotshow<span className="text-secondary">58</span></h1>
          </div>
          <h2 className="text-2xl font-bold text-surface-800 dark:text-surface-100 mb-1">Welcome Back</h2>
          <p className="text-surface-600 dark:text-surface-400">Sign in to access your account</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white dark:bg-surface-800 shadow-card rounded-xl p-6"
        >
          <div id="authentication" className="min-h-[300px]"></div>
          
          <div className="mt-4 text-center text-sm text-surface-600 dark:text-surface-400">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-primary hover:text-primary-dark">
              Sign up now
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;