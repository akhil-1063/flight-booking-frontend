import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [tripType, setTripType] = React.useState('roundtrip');
  const [origin, setOrigin] = React.useState('');
  const [destination, setDestination] = React.useState('');
  const [departureDate, setDepartureDate] = React.useState('');
  const [returnDate, setReturnDate] = React.useState('');
  const [passengers, setPassengers] = React.useState(1);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const searchParams = new URLSearchParams({
      origin,
      destination,
      departureDate,
      passengers: String(passengers),
      ...(tripType === 'roundtrip' && returnDate && { returnDate }),
    });

    navigate(`/search?${searchParams.toString()}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-2">Find & Book Your Flight</h1>
          <p className="text-xl opacity-90">Search millions of flights at the best prices</p>
        </div>
      </div>

      {/* Search Form */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSearch}>
            {/* Trip Type Selection */}
            <div className="mb-6 flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="roundtrip"
                  checked={tripType === 'roundtrip'}
                  onChange={(e) => setTripType(e.target.value)}
                  className="w-4 h-4"
                />
                <span>Round Trip</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="oneway"
                  checked={tripType === 'oneway'}
                  onChange={(e) => setTripType(e.target.value)}
                  className="w-4 h-4"
                />
                <span>One Way</span>
              </label>
            </div>

            {/* Search Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {/* Origin */}
              <div>
                <label className="block text-sm font-medium mb-2">From</label>
                <input
                  type="text"
                  placeholder="Departure City (IATA)"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Destination */}
              <div>
                <label className="block text-sm font-medium mb-2">To</label>
                <input
                  type="text"
                  placeholder="Destination City (IATA)"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Departure Date */}
              <div>
                <label className="block text-sm font-medium mb-2">Depart</label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* Return Date (if round trip) */}
              {tripType === 'roundtrip' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Return</label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              )}

              {/* Passengers */}
              <div>
                <label className="block text-sm font-medium mb-2">Passengers</label>
                <select
                  value={passengers}
                  onChange={(e) => setPassengers(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <option key={num} value={num}>
                      {num} Passenger{num > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
            >
              Search Flights
            </button>
          </form>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Why Choose FlightBook?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Best Prices', description: 'Compare prices from all airlines and book the cheapest flights' },
              { title: 'Easy Booking', description: 'Simple and secure booking process with multiple payment options' },
              { title: '24/7 Support', description: 'Customer support available round the clock for all queries' },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
