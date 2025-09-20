import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import messagesSlice from './slices/messagesSlice'
import chatRoomsSlice from './slices/chatRoomsSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    messages: messagesSlice,
    chatRooms: chatRoomsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

// TypeScript types would go here if using TypeScript
// export type RootState = ReturnType<typeof store.getState>
// export type AppDispatch = typeof store.dispatch
