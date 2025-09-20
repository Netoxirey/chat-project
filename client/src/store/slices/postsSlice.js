import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

// Async thunks
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 10, search = '' } = params
      const response = await axios.get(`${API_BASE_URL}/posts`, {
        params: { page, limit, search },
        withCredentials: true,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch posts')
    }
  }
)

export const fetchPostById = createAsyncThunk(
  'posts/fetchPostById',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/posts/${postId}`, {
        withCredentials: true,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch post')
    }
  }
)

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/posts`, postData, {
        withCredentials: true,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create post')
    }
  }
)

export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ postId, postData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/posts/${postId}`, postData, {
        withCredentials: true,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update post')
    }
  }
)

export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (postId, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/posts/${postId}`, {
        withCredentials: true,
      })
      return postId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete post')
    }
  }
)

const initialState = {
  posts: [],
  currentPost: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  isLoading: false,
  error: null,
}

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentPost: (state) => {
      state.currentPost = null
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch posts
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.isLoading = false
        state.posts = action.payload.data.posts
        state.pagination = action.payload.data.pagination
        state.error = null
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Fetch post by ID
      .addCase(fetchPostById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentPost = action.payload.data.post
        state.error = null
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Create post
      .addCase(createPost.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isLoading = false
        state.posts.unshift(action.payload.data.post)
        state.error = null
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Update post
      .addCase(updatePost.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.posts.findIndex(post => post.id === action.payload.data.post.id)
        if (index !== -1) {
          state.posts[index] = action.payload.data.post
        }
        if (state.currentPost?.id === action.payload.data.post.id) {
          state.currentPost = action.payload.data.post
        }
        state.error = null
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Delete post
      .addCase(deletePost.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.isLoading = false
        state.posts = state.posts.filter(post => post.id !== action.payload)
        if (state.currentPost?.id === action.payload) {
          state.currentPost = null
        }
        state.error = null
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearCurrentPost, setSearchQuery } = postsSlice.actions
export default postsSlice.reducer
