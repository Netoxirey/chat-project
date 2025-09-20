import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

// Async thunks
export const fetchComments = createAsyncThunk(
  'comments/fetchComments',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/posts/${postId}/comments`, {
        withCredentials: true,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch comments')
    }
  }
)

export const createComment = createAsyncThunk(
  'comments/createComment',
  async ({ postId, commentData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/posts/${postId}/comments`, commentData, {
        withCredentials: true,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create comment')
    }
  }
)

export const updateComment = createAsyncThunk(
  'comments/updateComment',
  async ({ postId, commentId, commentData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/posts/${postId}/comments/${commentId}`, commentData, {
        withCredentials: true,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update comment')
    }
  }
)

export const deleteComment = createAsyncThunk(
  'comments/deleteComment',
  async ({ postId, commentId }, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/posts/${postId}/comments/${commentId}`, {
        withCredentials: true,
      })
      return commentId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete comment')
    }
  }
)

const initialState = {
  comments: [],
  isLoading: false,
  error: null,
}

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearComments: (state) => {
      state.comments = []
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch comments
      .addCase(fetchComments.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.isLoading = false
        state.comments = action.payload.data.comments
        state.error = null
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Create comment
      .addCase(createComment.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.isLoading = false
        state.comments.push(action.payload.data.comment)
        state.error = null
      })
      .addCase(createComment.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Update comment
      .addCase(updateComment.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.comments.findIndex(comment => comment.id === action.payload.data.comment.id)
        if (index !== -1) {
          state.comments[index] = action.payload.data.comment
        }
        state.error = null
      })
      .addCase(updateComment.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Delete comment
      .addCase(deleteComment.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.isLoading = false
        state.comments = state.comments.filter(comment => comment.id !== action.payload)
        state.error = null
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearComments } = commentsSlice.actions
export default commentsSlice.reducer
