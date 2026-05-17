import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Passenger {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  passportNumber: string;
  nationality: string;
  seatNumber: string;
  mealPreference: string;
}

const BookingPage: React.FC = () => {
  const { flightId } = useParams<{ flightId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { accessToken } = useAuth();

  const flight = location.state?.flight;
  const selectedClass = location.state?.selectedClass || 'economy';

  const [passengers, setPassengers] = useState<Passenger[]>([
    { firstName: '', lastName: '', dateOfBirth: '', passportNumber: '', nationality: '', seatNumber: '', mealPreference: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!flight || !flightId) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded">
          <p>Invalid booking request. Please select a flight first.</p>
        </div>
      </div>
    );
  }

  const handlePassengerChange = (index: number, field: string, value: string) => {
    const newPassengers = [...passengers];
    newPassengers[index] = { ...newPassengers[index], [field]: value };
    setPassengers(newPassengers);
  };

  const handleAddPassenger = () => {
    setPassengers([
      ...passengers,
      { firstName: '', lastName: '', dateOfBirth: '', passportNumber: '', nationality: '', seatNumber: '', mealPreference: '' },
    ]);
  };

  const handleRemovePassenger = (index: number) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((_, i) => i !== index));
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accessToken) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Validate all passengers
      if (passengers.some((p) => !p.firstName || !p.lastName || !p.passportNumber || !p.dateOfBirth)) {
        setError('Please fill in all passenger details');
        setLoading(false);
        return;
      }

      const bookingData = {
        flightId,
        cabinClass: selectedClass,
        passengers: passengers.map((p) => ({
          ...p,
        })),
      };

      const response = await apiService.createBooking(bookingData, accessToken);
      const { bookingId, bookingReference } = response.data;

      // Navigate to payment
      navigate(`/payment/${bookingId}`, {
        state: { bookingReference, fareBreakdown: response.data.fareBreakdown },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const cabin = flight.cabinClasses.find((c: { type: string; baseFare: number; availableSeats: number }) => c.type === selectedClass);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Complete Your Booking</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mb-6">
          {error}
        </div>
      )}

      {/* Flight Summary */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Flight Details</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Flight</p>
            <p className="font-bold">{flight.flightNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Route</p>
            <p className="font-bold">
              {flight.origin.iataCode} → {flight.destination.iataCode}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Date</p>
            <p className="font-bold">{new Date(flight.departureTime).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Class</p>
            <p className="font-bold capitalize">{selectedClass}</p>
          </div>
        </div>
      </div>

      {/* Passenger Form */}
      <form onSubmit={handleBooking}>
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-6">Passenger Details</h2>

          {passengers.map((passenger, index) => (
            <div key={index} className="mb-8 pb-8 border-b last:border-b-0">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Passenger {index + 1}</h3>
                {passengers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemovePassenger(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  value={passenger.firstName}
                  onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={passenger.lastName}
                  onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
                <input
                  type="date"
                  placeholder="Date of Birth"
                  value={passenger.dateOfBirth}
                  onChange={(e) => handlePassengerChange(index, 'dateOfBirth', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Passport Number"
                  value={passenger.passportNumber}
                  onChange={(e) => handlePassengerChange(index, 'passportNumber', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Nationality"
                  value={passenger.nationality}
                  onChange={(e) => handlePassengerChange(index, 'nationality', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Seat Number (e.g., 1A)"
                  value={passenger.seatNumber}
                  onChange={(e) => handlePassengerChange(index, 'seatNumber', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
                <select
                  value={passenger.mealPreference}
                  onChange={(e) => handlePassengerChange(index, 'mealPreference', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 md:col-span-2"
                >
                  <option value="">Select Meal Preference</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="halal">Halal</option>
                  <option value="kosher">Kosher</option>
                  <option value="regular">Regular</option>
                </select>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddPassenger}
            className="text-blue-600 hover:text-blue-800 font-semibold mb-6"
          >
            + Add Another Passenger
          </button>
        </div>

        {/* Fare Summary */}
        {cabin && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Fare Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Base Fare (per person)</span>
                <span>${cabin.baseFare.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Base Fare ({passengers.length} passengers)</span>
                <span>${(cabin.baseFare * passengers.length).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & Fees</span>
                <span>${((cabin.baseFare * passengers.length * 0.125) + 15 * passengers.length).toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t-2 pt-2 text-lg font-bold">
                <span>Total</span>
                <span className="text-blue-600">
                  ${(cabin.baseFare * passengers.length + (cabin.baseFare * passengers.length * 0.125) + 15 * passengers.length).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition"
        >
          {loading ? 'Processing...' : 'Continue to Payment'}
        </button>
      </form>
    </div>
  );
};

export default BookingPage;
