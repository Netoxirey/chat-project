import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

// Async thunks
export const fetchChatRooms = createAsyncThunk(
  'chatRooms/fetchChatRooms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/chat-rooms')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch chat rooms')
    }
  }
)

export const fetchChatRoom = createAsyncThunk(
  'chatRooms/fetchChatRoom',
  async (chatRoomId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/chat-rooms/${chatRoomId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch chat room')
    }
  }
)

export const createChatRoom = createAsyncThunk(
  'chatRooms/createChatRoom',
  async (chatRoomData, { rejectWithValue }) => {
    try {
      const response = await api.post('/chat-rooms', chatRoomData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create chat room')
    }
  }
)

export const updateChatRoom = createAsyncThunk(
  'chatRooms/updateChatRoom',
  async ({ chatRoomId, chatRoomData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/chat-rooms/${chatRoomId}`, chatRoomData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update chat room')
    }
  }
)

export const deleteChatRoom = createAsyncThunk(
  'chatRooms/deleteChatRoom',
  async (chatRoomId, { rejectWithValue }) => {
    try {
      await api.delete(`/chat-rooms/${chatRoomId}`)
      return chatRoomId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete chat room')
    }
  }
)

export const addUserToChatRoom = createAsyncThunk(
  'chatRooms/addUserToChatRoom',
  async ({ chatRoomId, userId }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/chat-rooms/${chatRoomId}/users`, { userId })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add user to chat room')
    }
  }
)

export const removeUserFromChatRoom = createAsyncThunk(
  'chatRooms/removeUserFromChatRoom',
  async ({ chatRoomId, userId }, { rejectWithValue }) => {
    try {
      await api.delete(`/chat-rooms/${chatRoomId}/users/${userId}`)
      return { chatRoomId, userId }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove user from chat room')
    }
  }
)

const initialState = {
  chatRooms: [],
  currentChatRoom: null,
  isLoading: false,
  error: null,
}

const chatRoomsSlice = createSlice({
  name: 'chatRooms',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentChatRoom: (state) => {
      state.currentChatRoom = null
    },
    updateLastMessage: (state, action) => {
      const { chatRoomId, message } = action.payload
      const chatRoom = state.chatRooms.find(cr => cr.id === chatRoomId)
      if (chatRoom) {
        chatRoom.lastMessage = message
        chatRoom.updatedAt = new Date().toISOString()
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch chat rooms
      .addCase(fetchChatRooms.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchChatRooms.fulfilled, (state, action) => {
        state.isLoading = false
        state.chatRooms = action.payload.data.chatRooms
        state.error = null
      })
      .addCase(fetchChatRooms.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Fetch chat room
      .addCase(fetchChatRoom.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchChatRoom.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentChatRoom = action.payload.data.chatRoom
        state.error = null
      })
      .addCase(fetchChatRoom.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Create chat room
      .addCase(createChatRoom.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createChatRoom.fulfilled, (state, action) => {
        state.isLoading = false
        state.chatRooms.unshift(action.payload.data.chatRoom)
        state.error = null
      })
      .addCase(createChatRoom.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Update chat room
      .addCase(updateChatRoom.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateChatRoom.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.chatRooms.findIndex(cr => cr.id === action.payload.data.chatRoom.id)
        if (index !== -1) {
          state.chatRooms[index] = action.payload.data.chatRoom
        }
        if (state.currentChatRoom?.id === action.payload.data.chatRoom.id) {
          state.currentChatRoom = action.payload.data.chatRoom
        }
        state.error = null
      })
      .addCase(updateChatRoom.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Delete chat room
      .addCase(deleteChatRoom.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteChatRoom.fulfilled, (state, action) => {
        state.isLoading = false
        state.chatRooms = state.chatRooms.filter(cr => cr.id !== action.payload)
        if (state.currentChatRoom?.id === action.payload) {
          state.currentChatRoom = null
        }
        state.error = null
      })
      .addCase(deleteChatRoom.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Add user to chat room
      .addCase(addUserToChatRoom.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(addUserToChatRoom.fulfilled, (state, action) => {
        state.isLoading = false
        const { chatRoomId, user } = action.payload.data
        const chatRoom = state.chatRooms.find(cr => cr.id === chatRoomId)
        if (chatRoom && !chatRoom.users.find(u => u.id === user.id)) {
          chatRoom.users.push(user)
        }
        state.error = null
      })
      .addCase(addUserToChatRoom.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Remove user from chat room
      .addCase(removeUserFromChatRoom.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(removeUserFromChatRoom.fulfilled, (state, action) => {
        state.isLoading = false
        const { chatRoomId, userId } = action.payload
        const chatRoom = state.chatRooms.find(cr => cr.id === chatRoomId)
        if (chatRoom) {
          chatRoom.users = chatRoom.users.filter(u => u.id !== userId)
        }
        state.error = null
      })
      .addCase(removeUserFromChatRoom.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearCurrentChatRoom, updateLastMessage } = chatRoomsSlice.actions
export default chatRoomsSlice.reducer
