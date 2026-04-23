import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:4000';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('🔗 WebSocket connected');
      socket.emit('joinUserRoom', user.id);
    });

    socket.on('video-processing-complete', (data) => {
      toast.success(`Video "${data.title}" is ready!`);
    });

    socket.on('video-processing-failed', (data) => {
      toast.error(`Video "${data.title}" processing failed.`);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return socketRef.current;
};
