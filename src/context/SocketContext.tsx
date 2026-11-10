import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { Complaint, NotificationItem, ComplaintStats } from '../types';

interface RealtimeToast {
  id: string;
  message: string;
  complaintId?: string;
  type: 'info' | 'success' | 'warning';
  timestamp: Date;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  toasts: RealtimeToast[];
  removeToast: (id: string) => void;
  notifications: NotificationItem[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  onComplaintUpdated: (handler: (complaint: Complaint) => void) => () => void;
  onComplaintCreated: (handler: (complaint: Complaint) => void) => () => void;
  onStatsUpdated: (handler: (stats: ComplaintStats) => void) => () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [toasts, setToasts] = useState<RealtimeToast[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const addToast = useCallback((message: string, type: 'info' | 'success' | 'warning' = 'info', complaintId?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: RealtimeToast = { id, message, complaintId, type, timestamp: new Date() };
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 7000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, [token]);

  const markNotificationAsRead = async (id: string) => {
    if (!token) return;
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!token) return;
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  // Socket initialization
  useEffect(() => {
    const s = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
    });

    s.on('connect', () => {
      setIsConnected(true);
      if (user) {
        s.emit('join:user', user._id);
        if (user.role === 'admin') {
          s.emit('join:admin');
        }
      }
    });

    s.on('disconnect', () => {
      setIsConnected(false);
    });

    // Real-time notification received
    s.on('notification:new', (payload: { complaintId: string; status: string; message: string }) => {
      addToast(payload.message, payload.status === 'Resolved' ? 'success' : 'info', payload.complaintId);
      fetchNotifications();
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [addToast, fetchNotifications, user]);

  // When user changes, join rooms and fetch notifications
  useEffect(() => {
    if (socket && isConnected && user) {
      socket.emit('join:user', user._id);
      if (user.role === 'admin') {
        socket.emit('join:admin');
      }
      fetchNotifications();
    }
  }, [user, socket, isConnected, fetchNotifications]);

  const onComplaintUpdated = useCallback(
    (handler: (complaint: Complaint) => void) => {
      if (!socket) return () => {};
      socket.on('complaint:updated', handler);
      return () => {
        socket.off('complaint:updated', handler);
      };
    },
    [socket]
  );

  const onComplaintCreated = useCallback(
    (handler: (complaint: Complaint) => void) => {
      if (!socket) return () => {};
      socket.on('complaint:created', handler);
      return () => {
        socket.off('complaint:created', handler);
      };
    },
    [socket]
  );

  const onStatsUpdated = useCallback(
    (handler: (stats: ComplaintStats) => void) => {
      if (!socket) return () => {};
      socket.on('stats:updated', handler);
      return () => {
        socket.off('stats:updated', handler);
      };
    },
    [socket]
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        toasts,
        removeToast,
        notifications,
        unreadCount,
        fetchNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        onComplaintUpdated,
        onComplaintCreated,
        onStatsUpdated,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
