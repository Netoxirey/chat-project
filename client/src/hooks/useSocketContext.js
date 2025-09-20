import { useContext } from 'react'
import { SocketContext } from '../contexts/socketContext'

export const useSocketContext = () => {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocketContext must be used within a SocketProvider')
  }
  return context
}
