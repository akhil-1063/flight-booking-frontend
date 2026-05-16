import React, { useEffect, useState } from 'react';
import { useRealtimeBooking } from '../hooks/useRealtimeBooking';

interface RealtimeNotificationProps {
  accessToken: string | null;
}

interface Notification {
  id: string;
  type: string;
  message: string;
  title?: string;
  color: string;
  icon: string;
  dismissible: boolean;
}

export const RealtimeNotifications: React.FC<RealtimeNotificationProps> = ({ accessToken }) => {
  const { connected, events } = useRealtimeBooking(accessToken);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Process events and create notifications
  useEffect(() => {
    const newNotifications: Notification[] = [];
    let id = Date.now();

    if (events.bookingNotification) {
      newNotifications.push({
        id: `notif-${id++}`,
        type: 'booking',
        message: events.bookingNotification.data?.message || 'Booking updated',
        color: 'bg-blue-50 border-blue-200 text-blue-800',
        icon: '📦',
        dismissible: true,
      });
    }

    if (events.paymentNotification) {
      const isPaid = events.paymentNotification.data?.type === 'payment_confirmed';
      newNotifications.push({
        id: `notif-${id++}`,
        type: 'payment',
        message: events.paymentNotification.data?.message || 'Payment processed',
        title: isPaid ? '💳 Payment Confirmed' : '❌ Payment Failed',
        color: isPaid ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800',
        icon: isPaid ? '✅' : '❌',
        dismissible: true,
      });
    }

    if (events.flightStatusUpdate) {
      newNotifications.push({
        id: `notif-${id++}`,
        type: 'flight',
        message: events.flightStatusUpdate.message,
        title: '✈️ Flight Update',
        color: 'bg-orange-50 border-orange-200 text-orange-800',
        icon: '⏱️',
        dismissible: true,
      });
    }

    if (events.seatUnavailable) {
      newNotifications.push({
        id: `notif-${id++}`,
        type: 'seat',
        message: events.seatUnavailable.message,
        title: '⚠️ Seat Unavailable',
        color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        icon: '💺',
        dismissible: true,
      });
    }

    if (events.systemNotification) {
      const colors = {
        info: 'bg-blue-50 border-blue-200 text-blue-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        alert: 'bg-red-50 border-red-200 text-red-800',
      };
      newNotifications.push({
        id: `notif-${id++}`,
        type: 'system',
        message: events.systemNotification.message,
        title: events.systemNotification.title,
        color: colors[events.systemNotification.type],
        icon: '🔔',
        dismissible: true,
      });
    }

    if (newNotifications.length > 0) {
      setNotifications((prev) => [...prev, ...newNotifications]);
    }
  }, [events]);

  // Auto-dismiss notifications after 5 seconds
  useEffect(() => {
    if (notifications.length === 0) return;

    const timer = setTimeout(() => {
      setNotifications((prev) => prev.slice(1));
    }, 5000);

    return () => clearTimeout(timer);
  }, [notifications]);

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`${notif.color} border-l-4 p-4 rounded-lg shadow-lg flex items-start justify-between animate-slideIn`}
        >
          <div className="flex items-start gap-3">
            <span className="text-xl mt-1">{notif.icon}</span>
            <div>
              {notif.title && <h3 className="font-semibold">{notif.title}</h3>}
              <p className="text-sm">{notif.message}</p>
            </div>
          </div>
          {notif.dismissible && (
            <button
              onClick={() => dismissNotification(notif.id)}
              className="text-xl ml-2 hover:opacity-70 transition"
            >
              ✕
            </button>
          )}
        </div>
      ))}

      {/* Connection indicator */}
      <div
        className={`px-3 py-2 rounded text-sm text-center ${
          connected
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-600'
        }`}
      >
        {connected ? '🟢 Connected' : '⚪ Connecting...'}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default RealtimeNotifications;
