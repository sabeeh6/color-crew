// src/hooks/useAuth.js
import { useDispatch, useSelector } from 'react-redux';
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectToken,
  logout,
} from '../store/slices/authSlice';
import { useLoginMutation, useRegisterMutation } from '../store/api/authApi';

export const useAuth = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const token = useSelector(selectToken);
  const [loginMutation, { isLoading: loginLoading }] = useLoginMutation();
  const [registerMutation, { isLoading: registerLoading }] = useRegisterMutation();

  const login = async (email, password) => {
    // RTK Query handles dispatching setCredentials via onQueryStarted
    return await loginMutation({ email, password }).unwrap();
  };

  const register = async (name, email, password) => {
    return await registerMutation({ name, email, password }).unwrap();
  };

  const logoutUser = () => {
    dispatch(logout());
  };

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logoutUser,
    loginLoading,
    registerLoading,
  };
};