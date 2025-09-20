import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

// Async thunks
export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async (chatRoomId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/messages/chat-room/${chatRoomId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages')
    }
  }
)

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async (messageData, { rejectWithValue }) => {
    try {
      const response = await api.post('/messages', messageData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message')
    }
  }
)

export const editMessage = createAsyncThunk(
  'messages/editMessage',
  async ({ messageId, content }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/messages/${messageId}`, { content })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to edit message')
    }
  }
)

export const deleteMessage = createAsyncThunk(
  'messages/deleteMessage',
  async (messageId, { rejectWithValue }) => {
    try {
      await api.delete(`/messages/${messageId}`)
      return messageId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete message')
    }
  }
)

export const markMessagesAsRead = createAsyncThunk(
  'messages/markMessagesAsRead',
  async ({ chatRoomId, messageIds }, { rejectWithValue }) => {
    try {
      const response = await api.put('/messages/mark-read', {
        chatRoomId,
        messageIds,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark messages as read')
    }
  }
)

const initialState = {
  messages: [],
  isLoading: false,
  error: null,
}

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearMessages: (state) => {
      state.messages = []
    },
    addMessage: (state, action) => {
      // Check if message already exists to avoid duplicates
      const exists = state.messages.find(msg => msg.id === action.payload.id)
      if (!exists) {
        state.messages.push(action.payload)
      }
    },
    updateMessage: (state, action) => {
      const index = state.messages.findIndex(msg => msg.id === action.payload.id)
      if (index !== -1) {
        state.messages[index] = action.payload
      }
    },
    removeMessage: (state, action) => {
      state.messages = state.messages.filter(msg => msg.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false
        state.messages = action.payload.data.messages
        state.error = null
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false
        state.messages.push(action.payload.data.message)
        state.error = null
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Edit message
      .addCase(editMessage.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(editMessage.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.messages.findIndex(msg => msg.id === action.payload.data.message.id)
        if (index !== -1) {
          state.messages[index] = action.payload.data.message
        }
        state.error = null
      })
      .addCase(editMessage.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Delete message
      .addCase(deleteMessage.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.isLoading = false
        state.messages = state.messages.filter(msg => msg.id !== action.payload)
        state.error = null
      })
      .addCase(deleteMessage.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Mark messages as read
      .addCase(markMessagesAsRead.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        state.isLoading = false
        // Update read status for specified messages
        action.payload.data.messageIds.forEach(messageId => {
          const message = state.messages.find(msg => msg.id === messageId)
          if (message) {
            message.isRead = true
          }
        })
        state.error = null
      })
      .addCase(markMessagesAsRead.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearMessages, addMessage, updateMessage, removeMessage } = messagesSlice.actions
export default messagesSlice.reducer
