import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Flight {
  _id: string;
  flightNumber: string;
  airline: string;
  origin: { iataCode: string; city: string };
  destination: { iataCode: string; city: string };
  departureTime: string;
  arrivalTime: string;
  duration: number;
  stops: number;
  cabinClasses: Array<{
    type: string;
    baseFare: number;
    availableSeats: number;
  }>;
}

const SearchFlightsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('price');

  useEffect(() => {
    const searchFlights = async () => {
      try {
        setLoading(true);
        setError(null);

        const origin = searchParams.get('origin');
        const destination = searchParams.get('destination');
        const departureDate = searchParams.get('departureDate');

        const params: Record<string, string | number> = {
          sortBy,
          page: 1,
          limit: 20,
        };

        // Add search filters only if provided
        if (origin) params.origin = origin;
        if (destination) params.destination = destination;
        if (departureDate) params.departureDate = departureDate;
        const returnDate = searchParams.get('returnDate');
        if (returnDate) params.returnDate = returnDate;
        if (searchParams.get('passengers')) params.passengers = parseInt(searchParams.get('passengers') || '1');

        const response = await apiService.searchFlights(params as any, accessToken || undefined);
        setFlights(response.data.flights);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to search flights');
      } finally {
        setLoading(false);
      }
    };

    searchFlights();
  }, [searchParams, sortBy, accessToken]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">Loading flights...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {searchParams.get('origin') || searchParams.get('destination') 
            ? 'Search Results' 
            : 'All Available Flights'}
        </h1>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="price">Sort by Price</option>
          <option value="duration">Sort by Duration</option>
          <option value="departure">Sort by Departure</option>
        </select>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mb-6">{error}</div>}

      {flights.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-600">No flights found matching your search criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {flights.map((flight) => (
            <div
              key={flight._id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition"
            >
              <div className="grid md:grid-cols-4 gap-4">
                {/* Flight Info */}
                <div>
                  <div className="text-lg font-bold">{flight.flightNumber}</div>
                  <div className="text-sm text-gray-600">{flight.airline}</div>
                </div>

                {/* Time Info */}
                <div>
                  <div className="font-bold">
                    {new Date(flight.departureTime).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <div className="text-sm text-gray-600">{flight.origin.iataCode}</div>
                </div>

                {/* Duration and Stops */}
                <div className="flex flex-col items-center justify-center">
                  <div className="text-sm text-gray-600">{Math.floor(flight.duration / 60)}h {flight.duration % 60}m</div>
                  <div className="text-xs text-gray-500">{flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}</div>
                </div>

                {/* Arrival Time and Price */}
                <div className="flex justify-between items-end">
                  <div>
                    <div className="font-bold">
                      {new Date(flight.arrivalTime).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    <div className="text-sm text-gray-600">{flight.destination.iataCode}</div>
                  </div>

                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      ${flight.cabinClasses[0]?.baseFare || 'N/A'}
                    </div>
                    <button
                      onClick={() => navigate(`/flight/${flight._id}`)}
                      className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Select
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchFlightsPage;
