import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRealtimeBooking } from '../hooks/useRealtimeBooking';
import { apiService } from '../services/api';

interface PaymentPageState {
  bookingReference?: string;
  fareBreakdown?: {
    baseFare: number;
    taxes: number;
    fees: number;
    totalAmount: number;
    currency: string;
  };
}

const PaymentPageWithRealtime: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const state = location.state as PaymentPageState;

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [provider, setProvider] = useState('stripe');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Real-time booking
  const { connected, events, joinBooking, leaveBooking } = useRealtimeBooking(accessToken);

  // Join booking room on mount
  useEffect(() => {
    if (bookingId) {
      joinBooking(bookingId);
    }
    return () => {
      if (bookingId) {
        leaveBooking(bookingId);
      }
    };
  }, [bookingId, joinBooking, leaveBooking]);

  // Handle payment confirmation via real-time event
  useEffect(() => {
    const timer = setTimeout(() => {
      if (events.paymentNotification?.data?.type === 'payment_confirmed') {
        setSuccess(true);
        setLoading(false);
        setTimeout(() => {
          navigate('/my-bookings');
        }, 2000);
      }

      if (events.paymentNotification?.data?.type === 'payment_failed') {
        setError(events.paymentNotification.data.message);
        setLoading(false);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [events.paymentNotification, navigate]);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Initiate payment
      const initiateRes = await apiService.initiatePayment(
        {
          bookingId: bookingId!,
          paymentMethod,
          provider,
        },
        accessToken!
      );

      if (initiateRes.data?.data?.providerTransactionId) {
        // Simulate payment processing
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Confirm payment
        const confirmRes = await apiService.confirmPayment(
          initiateRes.data.data.providerTransactionId,
          accessToken!
        );

        if (confirmRes.data?.success) {
          // Real-time event will handle the rest
          console.log('Payment confirmed successfully');
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment failed';
      setError(message);
      setLoading(false);
    }
  };

  if (!bookingId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Invalid Booking</h1>
          <p className="text-gray-600 mt-2">Please try booking again</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Connection Status */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">Real-time Status</h3>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                connected
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {connected ? '🟢 Connected' : '🟡 Connecting...'}
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        {state?.fareBreakdown && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Booking Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Booking Reference:</span>
                <span className="font-semibold">{state.bookingReference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Base Fare:</span>
                <span className="font-semibold">
                  {state.fareBreakdown.currency} {state.fareBreakdown.baseFare}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taxes (12.5%):</span>
                <span className="font-semibold">
                  {state.fareBreakdown.currency} {state.fareBreakdown.taxes}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fees:</span>
                <span className="font-semibold">
                  {state.fareBreakdown.currency} {state.fareBreakdown.fees}
                </span>
              </div>
              <div className="border-t-2 pt-2 mt-2 flex justify-between">
                <span className="font-bold">Total Amount:</span>
                <span className="text-xl font-bold text-blue-600">
                  {state.fareBreakdown.currency} {state.fareBreakdown.totalAmount}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Payment Form */}
        {!success && (
          <form
            onSubmit={handlePaymentSubmit}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-6">Payment Details</h2>

            {/* Payment Method */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['card', 'wallet', 'bank_transfer'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`p-3 rounded-lg border-2 transition capitalize ${
                      paymentMethod === method
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    {method === 'card' && '💳 Card'}
                    {method === 'wallet' && '👛 Wallet'}
                    {method === 'bank_transfer' && '🏦 Bank'}
                  </button>
                ))}
              </div>
            </div>

            {/* Provider */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Payment Provider
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['stripe', 'razorpay'].map((prov) => (
                  <button
                    key={prov}
                    type="button"
                    onClick={() => setProvider(prov)}
                    className={`p-3 rounded-lg border-2 transition capitalize ${
                      provider === prov
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    {prov === 'stripe' && '🔵 Stripe'}
                    {prov === 'razorpay' && '🟡 Razorpay'}
                  </button>
                ))}
              </div>
            </div>

            {/* Card Details */}
            {paymentMethod === 'card' && (
              <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.slice(0, 16))}
                    placeholder="4242 4242 4242 4242"
                    maxLength={16}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry (MM/YY)
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value.slice(0, 5))}
                      placeholder="12/25"
                      maxLength={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVC
                    </label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value.slice(0, 4))}
                      placeholder="123"
                      maxLength={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Pay Button */}
            <button
              type="submit"
              disabled={loading || !connected}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition ${
                loading || !connected
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? '🔄 Processing...' : `Pay ${state?.fareBreakdown?.currency} ${state?.fareBreakdown?.totalAmount}`}
            </button>

            {/* Security Notes */}
            <div className="mt-4 text-center text-xs text-gray-500 space-y-1">
              <p>🔒 Your payment is secure and encrypted</p>
              <p>Test Card: 4242 4242 4242 4242</p>
            </div>
          </form>
        )}

        {/* Success State */}
        {success && (
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-4">Your booking is confirmed</p>
            <p className="text-sm text-gray-500">Redirecting to My Bookings...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPageWithRealtime;
