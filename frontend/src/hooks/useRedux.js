import { useSelector, useDispatch } from 'react-redux'
import { useCallback } from 'react'
import { login, register, validateToken } from '../store/slices/authSlice'
import { 
  fetchVideos, 
  getVideo, 
  uploadVideo, 
  getDashboardStats 
} from '../store/slices/videoSlice'

// Typed hooks
export const useAppDispatch = () => useDispatch()
export const useAppSelector = (selector) => useSelector(selector)

// Auth hooks
export const useAuth = () => {
  const auth = useAppSelector(state => state.auth)
  const dispatch = useAppDispatch()
  
  const loginUser = useCallback((credentials) => {
    return dispatch(login(credentials))
      .unwrap()
      .catch((error) => {
        console.error('Login failed:', error);
        throw error;
      });
  }, [dispatch]);

  const registerUser = useCallback((userData) => {
    return dispatch(register(userData))
      .unwrap()
      .catch((error) => {
        console.error('Registration failed:', error);
        throw error;
      });
  }, [dispatch]);

  const logout = useCallback(() => {
    dispatch({ type: 'auth/logout' });
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch({ type: 'auth/clearError' });
  }, [dispatch]);

  return {
    ...auth,
    loginUser,
    registerUser,
    logout,
    clearError
  };
};

// Video hooks
export const useVideos = () => {
  const videos = useAppSelector(state => state.videos)
  const dispatch = useAppDispatch();
  
  const fetchVideosAction = useCallback((params) => {
    return dispatch(fetchVideos(params))
      .unwrap()
      .catch((error) => {
        console.error('Fetch videos failed:', error);
        throw error;
      });
  }, [dispatch]);

  const getVideoAction = useCallback((id) => {
    return dispatch(getVideo(id))
      .unwrap()
      .catch((error) => {
        console.error('Get video failed:', error);
        throw error;
      });
  }, [dispatch]);

  const uploadVideoAction = useCallback((formData, title) => {
    return dispatch(uploadVideo({ formData, title }))
      .unwrap()
      .catch((error) => {
        console.error('Upload failed:', error);
        throw error;
      });
  }, [dispatch]);

  const getDashboardStatsAction = useCallback(() => {
    return dispatch(getDashboardStats())
      .unwrap()
      .catch((error) => {
        console.error('Get stats failed:', error);
        throw error;
      });
  }, [dispatch]);

  const setFilters = useCallback((filters) => {
    dispatch({ type: 'videos/setFilters', payload: filters });
  }, [dispatch]);

  const updateVideoStatus = useCallback((videoId, status, progress) => {
    dispatch({ type: 'videos/updateVideoStatus', payload: { videoId, status, progress } });
  }, [dispatch]);

  const clearCurrentVideo = useCallback(() => {
    dispatch({ type: 'videos/clearCurrentVideo' });
  }, [dispatch]);

  return {
    ...videos,
    fetchVideos: fetchVideosAction,
    getVideo: getVideoAction,
    uploadVideo: uploadVideoAction,
    getDashboardStats: getDashboardStatsAction,
    setFilters,
    updateVideoStatus,
    clearCurrentVideo
  };
};

// UI hooks
export const useUI = () => {
  const ui = useAppSelector(state => state.ui)
  const dispatch = useAppDispatch();
  
  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'ui/toggleSidebar' });
  }, [dispatch]);

  const setSidebarOpen = useCallback((open) => {
    dispatch({ type: 'ui/setSidebarOpen', payload: open });
  }, [dispatch]);

  const addNotification = useCallback((notification) => {
    dispatch({ type: 'ui/addNotification', payload: notification });
  }, [dispatch]);

  const removeNotification = useCallback((id) => {
    dispatch({ type: 'ui/removeNotification', payload: id });
  }, [dispatch]);

  const clearNotifications = useCallback(() => {
    dispatch({ type: 'ui/clearNotifications' });
  }, [dispatch]);

  const setLoading = useCallback((key, value) => {
    dispatch({ type: 'ui/setLoading', payload: { key, value } });
  }, [dispatch]);

  return {
    ...ui,
    toggleSidebar,
    setSidebarOpen,
    addNotification,
    removeNotification,
    clearNotifications,
    setLoading
  };
};
