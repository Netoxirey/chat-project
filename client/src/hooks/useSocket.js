import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './useAuth'

export const useSocket = () => {
  const socketRef = useRef(null)
  const [socket, setSocket] = useState(null)
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect to socket server (ensure pure origin, no path)
      const rawUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
      let serverUrl
      try {
        const u = new URL(rawUrl)
        serverUrl = `${u.protocol}//${u.host}`
      } catch {
        serverUrl = 'http://localhost:3000'
      }
      console.log('Connecting to Socket.io server:', serverUrl)
      console.log('User:', user)
      
      const instance = io(serverUrl, {
        withCredentials: true,
        autoConnect: true,
        transports: ['polling', 'websocket'],
        timeout: 20000,
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        upgrade: true,
        rememberUpgrade: false,
      })
      socketRef.current = instance
      setSocket(instance)

      // Connection event handlers
      instance.on('connect', () => {
        console.log('Socket connected:', instance.id)
        console.log('Socket transport:', instance.io.engine.transport.name)
        console.log('Socket namespace:', instance.nsp.name)
        console.log('Socket server URL:', instance.io.uri)
        console.log('Socket connected status:', instance.connected)
      })

      instance.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason)
        console.log('Socket connected status:', instance.connected)
      })

      instance.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        console.log('Socket connected status:', instance.connected)
      })

      instance.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        console.error('Error details:', {
          message: error.message,
          description: error.description,
          context: error.context,
          type: error.type
        })
        if (error.message.includes('CORS')) {
          console.error('CORS error detected. Check server CORS configuration.')
        }
        if (error.message.includes('namespace')) {
          console.error('Namespace error detected. Check server namespace configuration.')
        }
      })

      instance.on('error', (error) => {
        console.error('Socket error:', error)
      })

      return () => {
        if (socketRef.current) {
          console.log('Disconnecting socket...')
          try { socketRef.current.disconnect() } catch { /* noop */ }
          socketRef.current = null
          setSocket(null)
        }
      }
    } else {
      // Disconnect if user is not authenticated
      if (socketRef.current) {
        console.log('User not authenticated, disconnecting socket...')
        try { socketRef.current.disconnect() } catch { /* noop */ }
        socketRef.current = null
        setSocket(null)
      }
    }
  }, [isAuthenticated, user])

  return socket
}
