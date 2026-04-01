import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { videoAPI } from '../../services/api'

// Async thunks
export const fetchVideos = createAsyncThunk(
  'videos/fetchVideos',
  async (params, { rejectWithValue }) => {
    try {
      const response = await videoAPI.getVideos(params)
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch videos'
      return rejectWithValue(message)
    }
  }
)

export const getVideo = createAsyncThunk(
  'videos/getVideo',
  async (id, { rejectWithValue }) => {
    try {
      const response = await videoAPI.getVideo(id)
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to get video'
      return rejectWithValue(message)
    }
  }
)

export const uploadVideo = createAsyncThunk(
  'videos/uploadVideo',
  async ({ formData, title }, { rejectWithValue }) => {
    try {
      const response = await videoAPI.uploadVideo(formData, title)
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to upload video'
      return rejectWithValue(message)
    }
  }
)

export const getDashboardStats = createAsyncThunk(
  'videos/getDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Making API call to get dashboard stats...')
      const response = await videoAPI.getDashboardStats()
      console.log('Dashboard stats API response:', response.data)
      return response.data
    } catch (error) {
      console.error('Dashboard stats API error:', error)
      const message = error.response?.data?.message || 'Failed to get stats'
      return rejectWithValue(message)
    }
  }
)

const videoSlice = createSlice({
  name: 'videos',
  initialState: {
    videos: [],
    currentVideo: null,
    stats: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 12,
      total: 0,
      pages: 0
    },
    filters: {
      search: '',
      category: '',
      status: ''
    }
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    updateVideoStatus: (state, action) => {
      const { videoId, status, progress } = action.payload
      const video = state.videos.find(v => v._id === videoId)
      if (video) {
        video.status = status
        video.progress = progress
      }
    },
    clearCurrentVideo: (state) => {
      state.currentVideo = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Videos
      .addCase(fetchVideos.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchVideos.fulfilled, (state, action) => {
        state.loading = false
        state.videos = action.payload.videos
        state.pagination = action.payload.pagination
        state.error = null
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get Video
      .addCase(getVideo.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getVideo.fulfilled, (state, action) => {
        state.loading = false
        state.currentVideo = action.payload.video
        state.error = null
      })
      .addCase(getVideo.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Upload Video
      .addCase(uploadVideo.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(uploadVideo.fulfilled, (state, action) => {
        state.loading = false
        state.videos.unshift(action.payload.video)
        state.error = null
      })
      .addCase(uploadVideo.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get Dashboard Stats
      .addCase(getDashboardStats.pending, (state) => {
        console.log('getDashboardStats.pending - setting loading to true')
        state.loading = true
        state.error = null
      })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        console.log('getDashboardStats.fulfilled - updating stats:', action.payload)
        state.loading = false
        state.stats = action.payload
        state.error = null
      })
      .addCase(getDashboardStats.rejected, (state, action) => {
        console.log('getDashboardStats.rejected - error:', action.payload)
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { setFilters, updateVideoStatus, clearCurrentVideo } = videoSlice.actions
export default videoSlice.reducer
