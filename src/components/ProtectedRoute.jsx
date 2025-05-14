import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Component to protect routes that require authentication
 * Redirects to login with return path if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.user);
  const location = useLocation();
  
  if (!isAuthenticated) {
    // Redirect to login with the current path for redirect after login
    return (
      <Navigate 
        to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} 
        replace 
      />
    );
  }
  
  return children;
};

export default ProtectedRoute;