import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import Spinner from '../ui/Spinner';

/**
 * ProtectedRoute
 * Wraps any routes that require authentication.
 * If the user is not authenticated, redirect to /login and
 * preserve the intended destination in `state.from` so
 * LoginPage can redirect back after success.
 */
const ProtectedRoute = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location        = useLocation();

  if (isAuthenticated === undefined) {
    // Auth state still rehydrating from localStorage
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-950">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // Render nested protected page
  return <Outlet />;
};

export default ProtectedRoute;
