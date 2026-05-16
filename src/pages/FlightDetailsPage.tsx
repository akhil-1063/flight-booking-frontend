import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Flight {
  _id: string;
  flightNumber: string;
  airline: string;
  origin: { iataCode: string; city: string; country: string; terminal?: string };
  destination: { iataCode: string; city: string; country: string; terminal?: string };
  departureTime: string;
  arrivalTime: string;
  duration: number;
  stops: number;
  aircraft: string;
  cabinClasses: Array<{
    type: 'economy' | 'business' | 'first';
    totalSeats: number;
    availableSeats: number;
    baseFare: number;
    currency: string;
  }>;
  amenities: string[];
}

const FlightDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { accessToken, isLoggedIn } = useAuth();
  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<'economy' | 'business' | 'first'>('economy');

  useEffect(() => {
    const fetchFlight = async () => {
      try {
        if (!id) return;
        setLoading(true);
        const response = await apiService.getFlightDetails(id, accessToken || undefined);
        setFlight(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch flight details');
      } finally {
        setLoading(false);
      }
    };

    fetchFlight();
  }, [id, accessToken]);

  if (loading) return <div className="text-center py-12">Loading flight details...</div>;
  if (error) return <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded">{error}</div>;
  if (!flight) return <div className="text-center py-12">Flight not found</div>;

  const handleBook = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    navigate(`/booking/${flight._id}`, { state: { flight, selectedClass } });
  };

  const selectedCabin = flight.cabinClasses.find((c) => c.type === selectedClass);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Flight Header */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold">{flight.flightNumber}</h1>
            <p className="text-gray-600">{flight.airline}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Aircraft: {flight.aircraft}</p>
            <p className="text-sm text-gray-600">{flight.stops === 0 ? 'Non-Stop' : `${flight.stops} Stop(s)`}</p>
          </div>
        </div>

        {/* Flight Route */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Departure */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">DEPARTURE</h3>
            <div className="text-2xl font-bold">
              {new Date(flight.departureTime).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
            <div className="text-lg font-semibold">{flight.origin.iataCode}</div>
            <div className="text-sm text-gray-600">
              {flight.origin.city}, {flight.origin.country}
            </div>
            {flight.origin.terminal && <div className="text-xs text-gray-500">Terminal {flight.origin.terminal}</div>}
            <div className="text-xs text-gray-500 mt-1">
              {new Date(flight.departureTime).toLocaleDateString()}
            </div>
          </div>

          {/* Duration */}
          <div className="flex flex-col items-center justify-center">
            <div className="text-sm text-gray-600 mb-2">
              {Math.floor(flight.duration / 60)}h {flight.duration % 60}m
            </div>
            <div className="w-full border-t-2 border-blue-600 relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-600 rounded-full -translate-x-1.5"></div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-600 rounded-full translate-x-1.5"></div>
            </div>
            <div className="text-sm text-gray-600 mt-2">
              {flight.stops === 0 ? 'Direct Flight' : `${flight.stops} Stop(s)`}
            </div>
          </div>

          {/* Arrival */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">ARRIVAL</h3>
            <div className="text-2xl font-bold">
              {new Date(flight.arrivalTime).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
            <div className="text-lg font-semibold">{flight.destination.iataCode}</div>
            <div className="text-sm text-gray-600">
              {flight.destination.city}, {flight.destination.country}
            </div>
            {flight.destination.terminal && <div className="text-xs text-gray-500">Terminal {flight.destination.terminal}</div>}
            <div className="text-xs text-gray-500 mt-1">
              {new Date(flight.arrivalTime).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Amenities */}
        {flight.amenities && flight.amenities.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Amenities & Services</h3>
            <div className="flex flex-wrap gap-2">
              {flight.amenities.map((amenity, idx) => (
                <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cabin Classes */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {flight.cabinClasses.map((cabin) => (
          <div
            key={cabin.type}
            onClick={() => setSelectedClass(cabin.type)}
            className={`border-2 rounded-lg p-6 cursor-pointer transition ${
              selectedClass === cabin.type
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-blue-300'
            }`}
          >
            <h3 className="text-lg font-bold capitalize mb-4">{cabin.type} Class</h3>
            <div className="space-y-2 mb-4">
              <p className="text-2xl font-bold text-blue-600">${cabin.baseFare}</p>
              <p className="text-sm text-gray-600">Available Seats: {cabin.availableSeats}</p>
              <p className="text-xs text-gray-500">Total Seats: {cabin.totalSeats}</p>
            </div>
            {cabin.availableSeats === 0 && (
              <p className="text-red-600 font-semibold text-sm">Not Available</p>
            )}
          </div>
        ))}
      </div>

      {/* Book Button */}
      {selectedCabin && selectedCabin.availableSeats > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600 mb-1">Total Price per Person</p>
              <p className="text-3xl font-bold text-blue-600">${selectedCabin.baseFare}</p>
            </div>
            <button
              onClick={handleBook}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg"
            >
              Continue to Booking
            </button>
          </div>
        </div>
      )}

      {selectedCabin && selectedCabin.availableSeats === 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded">
          <p className="font-semibold">This cabin class is currently not available. Please select a different cabin class.</p>
        </div>
      )}
    </div>
  );
};

export default FlightDetailsPage;
