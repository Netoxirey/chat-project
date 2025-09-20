import { useSocket } from '../hooks/useSocket'
import { SocketContext } from './socketContext'

export const SocketProvider = ({ children }) => {
  const socket = useSocket()

  return (
    <SocketContext.Provider value={{ socket, isConnected: socket?.connected || false }}>
      {children}
    </SocketContext.Provider>
  )
}
