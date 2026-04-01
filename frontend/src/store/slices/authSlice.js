import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authAPI } from '../../services/api'

// Initial state with localStorage persistence
const getInitialState = () => {
  try {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    
    console.log('Initial auth check - token:', token ? 'exists' : 'none')
    console.log('Initial auth check - user:', userStr ? 'exists' : 'none')
    
    const user = userStr ? JSON.parse(userStr) : null
    
    return {
      user: user,
      token: token,
      isAuthenticated: !!token,
      loading: false,
      error: null
    }
  } catch (error) {
    console.error('Error parsing initial auth state:', error)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null
    }
  }
}

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials)
      const { user, token } = response.data.data
      
      // Store in localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      return { user, token }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      return rejectWithValue(message)
    }
  }
)

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData)
      const { user, token } = response.data.data
      
      // Store in localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      return { user, token }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      return rejectWithValue(message)
    }
  }
)

export const validateToken = createAsyncThunk(
  'auth/validateToken',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Validating token...')
      const response = await authAPI.getProfile()
      console.log('Token validation response:', response.data)
      
      // Use localStorage user data instead of API response
      const userStr = localStorage.getItem('user')
      const user = userStr ? JSON.parse(userStr) : null
      
      return { user: user }
    } catch (error) {
      console.error('Token validation failed:', error)
      // Clear invalid token
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      const message = error.response?.data?.message || 'Invalid token'
      return rejectWithValue(message)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
    },
    clearError: (state) => {
      state.error = null
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.isAuthenticated = false
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.isAuthenticated = false
      })
      // Validate Token
      .addCase(validateToken.pending, (state) => {
        state.loading = true
      })
      .addCase(validateToken.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(validateToken.rejected, (state, action) => {
        state.loading = false
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.error = action.payload
      })
  }
})

export const { logout, clearError, setLoading } = authSlice.actions
export default authSlice.reducer
