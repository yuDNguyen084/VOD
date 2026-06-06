import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:4000';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    const socketInstance = io(SOCKET_URL, {
      withCredentials: true,
    });

    // Update state asynchronously to prevent synchronous cascading render warning
    Promise.resolve().then(() => {
      setSocket(socketInstance);
    });

    socketInstance.on('connect', () => {
      console.log('🔗 WebSocket connected');
      socketInstance.emit('joinUserRoom', user.id);
    });

    socketInstance.on('video-processing-complete', (data) => {
      toast.success(`Video "${data.title}" is ready!`);
    });

    socketInstance.on('video-processing-failed', (data) => {
      toast.error(`Video "${data.title}" processing failed.`);
    });

    return () => {
      socketInstance.disconnect();
      Promise.resolve().then(() => {
        setSocket(null);
      });
    };
  }, [user]);

  return socket;
};
