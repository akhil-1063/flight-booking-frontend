const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://booking-backend-n9p7.onrender.com/api/v1';

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  cabinClass?: string;
  sortBy?: string;
  order?: string;
  page?: number;
  limit?: number;
}

export interface BookingData {
  flightId: string;
  cabinClass: string;
  passengers: Array<{
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    passportNumber: string;
    nationality: string;
    seatNumber: string;
    mealPreference?: string;
  }>;
}

export interface PaymentData {
  bookingId: string;
  paymentMethod: string;
  provider: string;
}

class ApiService {
  private getHeaders(token?: string) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Flight APIs
  async searchFlights(params: FlightSearchParams, token?: string) {
    const queryParams = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined) as [string, string][]
    );

    const response = await fetch(`${API_BASE_URL}/flights/search?${queryParams}`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });

    if (!response.ok) throw new Error('Flight search failed');
    return response.json();
  }

  async getFlightDetails(flightId: string, token?: string) {
    const response = await fetch(`${API_BASE_URL}/flights/${flightId}`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });

    if (!response.ok) throw new Error('Failed to fetch flight details');
    return response.json();
  }

  async getSeatAvailability(flightId: string, token?: string) {
    const response = await fetch(`${API_BASE_URL}/flights/${flightId}/seats`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });

    if (!response.ok) throw new Error('Failed to fetch seat availability');
    return response.json();
  }

  // Booking APIs
  async createBooking(data: BookingData, token: string) {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to create booking');
    return response.json();
  }

  async getBooking(bookingId: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });

    if (!response.ok) throw new Error('Failed to fetch booking');
    return response.json();
  }

  async getUserBookings(token: string) {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });

    if (!response.ok) throw new Error('Failed to fetch user bookings');
    return response.json();
  }

  async cancelBooking(bookingId: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
      method: 'PUT',
      headers: this.getHeaders(token),
    });

    if (!response.ok) throw new Error('Failed to cancel booking');
    return response.json();
  }

  // Payment APIs
  async initiatePayment(data: PaymentData, token: string) {
    const response = await fetch(`${API_BASE_URL}/payments/initiate`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Failed to initiate payment');
    return response.json();
  }

  async confirmPayment(paymentIntentId: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/payments/confirm`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ paymentIntentId }),
    });

    if (!response.ok) throw new Error('Failed to confirm payment');
    return response.json();
  }

  async getPaymentDetails(bookingId: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/payments/${bookingId}`, {
      method: 'GET',
      headers: this.getHeaders(token),
    });

    if (!response.ok) throw new Error('Failed to fetch payment details');
    return response.json();
  }

  async requestRefund(bookingId: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/payments/refund/${bookingId}`, {
      method: 'POST',
      headers: this.getHeaders(token),
    });

    if (!response.ok) throw new Error('Failed to request refund');
    return response.json();
  }
}

export const apiService = new ApiService();
