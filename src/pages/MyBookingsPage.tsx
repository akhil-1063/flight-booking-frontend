import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Booking {
  _id: string;
  bookingReference: string;
  flightId: {
    flightNumber: string;
    origin: { iataCode: string };
    destination: { iataCode: string };
    departureTime: string;
  };
  status: string;
  passengers: Array<{ firstName: string; lastName: string }>;
  fareBreakdown: { totalAmount: number; currency: string };
  createdAt: string;
}

const MyBookingsPage: React.FC = () => {
  const { accessToken } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        if (!accessToken) return;
        setLoading(true);
        const response = await apiService.getUserBookings(accessToken);
        setBookings(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [accessToken]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!accessToken || !window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      setCancellingId(bookingId);
      await apiService.cancelBooking(bookingId, accessToken);
      
      // Update bookings list
      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, status: 'cancelled' } : b
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">Loading your bookings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <p className="text-gray-600 mb-4">You haven't made any bookings yet.</p>
          <a href="/search" className="text-blue-600 hover:text-blue-800 font-semibold">
            Search for flights →
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="grid md:grid-cols-4 gap-4 mb-4">
                {/* Flight Info */}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Flight</p>
                  <p className="font-bold text-lg">{booking.flightId.flightNumber}</p>
                  <p className="text-sm text-gray-600">
                    {booking.flightId.origin.iataCode} → {booking.flightId.destination.iataCode}
                  </p>
                </div>

                {/* Booking Reference */}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Booking Reference</p>
                  <p className="font-bold font-mono">{booking.bookingReference}</p>
                </div>

                {/* Status */}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span
                    className={`font-bold px-3 py-1 rounded-full text-sm ${
                      booking.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>

                {/* Amount */}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                  <p className="font-bold text-lg text-blue-600">
                    ${booking.fareBreakdown.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Passengers */}
              <div className="mb-4 pb-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Passengers ({booking.passengers.length})</p>
                <div className="flex flex-wrap gap-2">
                  {booking.passengers.map((passenger, idx) => (
                    <span key={idx} className="bg-gray-100 px-3 py-1 rounded text-sm">
                      {passenger.firstName} {passenger.lastName}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {booking.status === 'confirmed' && (
                  <>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                      Download Itinerary
                    </button>
                    {new Date(booking.flightId.departureTime) > new Date() && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        disabled={cancellingId === booking._id}
                        className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
                      >
                        {cancellingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                      </button>
                    )}
                  </>
                )}
                {booking.status === 'pending' && (
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Complete Payment
                  </button>
                )}
              </div>

              {/* Booking Date */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500">
                  Booked on {new Date(booking.createdAt).toLocaleDateString()} at{' '}
                  {new Date(booking.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
