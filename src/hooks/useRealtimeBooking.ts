import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'https://booking-backend-n9p7.onrender.com';

interface RealtimeNotification {
  type: string;
  data: any;
  timestamp: Date;
}

interface BookingStatusUpdate {
  bookingId: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  details: any;
  timestamp: Date;
}

interface SeatUpdate {
  flightId: string;
  cabinClass: string;
  availableSeats: number;
  totalSeats: number;
  timestamp: Date;
}

interface FlightStatusUpdate {
  flightId: string;
  status: string;
  details: any;
  message: string;
  timestamp: Date;
}

export interface RealtimeEvents {
  bookingStatusChanged?: BookingStatusUpdate;
  bookingNotification?: RealtimeNotification;
  paymentNotification?: RealtimeNotification;
  seatUpdate?: SeatUpdate;
  seatUnavailable?: {
    flightId: string;
    cabinClass: string;
    seatNumber: string;
    message: string;
    timestamp: Date;
  };
  seatAvailable?: {
    flightId: string;
    cabinClass: string;
    seatNumber: string;
    message: string;
    timestamp: Date;
  };
  flightStatusUpdate?: FlightStatusUpdate;
  priceUpdate?: {
    flightId: string;
    cabinClass: string;
    newPrice: number;
    oldPrice: number;
    priceChange: number;
    timestamp: Date;
  };
  notification?: RealtimeNotification;
  systemNotification?: {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'alert';
    timestamp: Date;
  };
}

export const useRealtimeBooking = (accessToken: string | null) => {
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<RealtimeEvents>({});
  const [loading, setLoading] = useState(true);

  // Connect to socket server
  useEffect(() => {
    if (!accessToken) {
      const timer = setTimeout(() => setLoading(false), 0);
      return () => clearTimeout(timer);
    }

    try {
      socketRef.current = io(SOCKET_SERVER_URL, {
        auth: {
          token: accessToken,
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling'],
      });

      // Connection events
      socketRef.current.on('connect', () => {
        console.log('✅ Socket connected:', socketRef.current?.id);
        setSocket(socketRef.current);
        setConnected(true);
        setLoading(false);
      });

      socketRef.current.on('disconnect', () => {
        console.log('❌ Socket disconnected');
        setConnected(false);
      });

      // Listen to all event types
      socketRef.current.on('booking-status-changed', (data: BookingStatusUpdate) => {
        console.log('📦 Booking status changed:', data);
        setEvents((prev) => ({ ...prev, bookingStatusChanged: data }));
      });

      socketRef.current.on('booking-notification', (data: RealtimeNotification) => {
        console.log('📬 Booking notification:', data);
        setEvents((prev) => ({ ...prev, bookingNotification: data }));
      });

      socketRef.current.on('payment-notification', (data: RealtimeNotification) => {
        console.log('💳 Payment notification:', data);
        setEvents((prev) => ({ ...prev, paymentNotification: data }));
      });

      socketRef.current.on('seat-update', (data: SeatUpdate) => {
        console.log('💺 Seat update:', data);
        setEvents((prev) => ({ ...prev, seatUpdate: data }));
      });

      socketRef.current.on('seat-unavailable', (data: { flightId: string, cabinClass: string, seatNumber: string, message: string, timestamp: Date }) => {
        console.log('❌ Seat unavailable:', data);
        setEvents((prev) => ({ ...prev, seatUnavailable: data }));
      });

      socketRef.current.on('seat-available', (data: { flightId: string, cabinClass: string, seatNumber: string, message: string, timestamp: Date }) => {
        console.log('✅ Seat available:', data);
        setEvents((prev) => ({ ...prev, seatAvailable: data }));
      });

      socketRef.current.on('flight-status-update', (data: FlightStatusUpdate) => {
        console.log('✈️ Flight status update:', data);
        setEvents((prev) => ({ ...prev, flightStatusUpdate: data }));
      });

      socketRef.current.on('price-update', (data: { flightId: string, cabinClass: string, newPrice: number, oldPrice: number, priceChange: number, timestamp: Date }) => {
        console.log('💰 Price update:', data);
        setEvents((prev) => ({ ...prev, priceUpdate: data }));
      });

      socketRef.current.on('notification', (data: RealtimeNotification) => {
        console.log('🔔 Notification:', data);
        setEvents((prev) => ({ ...prev, notification: data }));
      });

      socketRef.current.on('system-notification', (data: { title: string, message: string, type: 'info' | 'warning' | 'alert', timestamp: Date }) => {
        console.log('🚨 System notification:', data);
        setEvents((prev) => ({ ...prev, systemNotification: data }));
      });

      socketRef.current.on('error', (error: Error) => {
        console.error('❌ Socket error:', error);
      });
    } catch (error) {
      console.error('Failed to connect to socket:', error);
      const timer = setTimeout(() => setLoading(false), 0);
      return () => clearTimeout(timer);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [accessToken]);

  // Join booking room
  const joinBooking = useCallback((bookingId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join-booking', bookingId);
    }
  }, []);

  // Leave booking room
  const leaveBooking = useCallback((bookingId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave-booking', bookingId);
    }
  }, []);

  // Join flight room
  const joinFlight = useCallback((flightId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join-flight', flightId);
    }
  }, []);

  // Leave flight room
  const leaveFlight = useCallback((flightId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave-flight', flightId);
    }
  }, []);

  // Send heartbeat
  const ping = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('ping');
    }
  }, []);

  return {
    socket,
    connected,
    loading,
    events,
    joinBooking,
    leaveBooking,
    joinFlight,
    leaveFlight,
    ping,
  };
};

export default useRealtimeBooking;
