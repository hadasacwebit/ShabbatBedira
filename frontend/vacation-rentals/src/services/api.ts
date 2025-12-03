import axios from 'axios';
import { AuthResponse, Apartment, CreateApartmentDto, UpdateApartmentDto, ApartmentSearchParams, PagedResult, PaymentResponse } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', { name, email, password });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
  },

  googleLogin: async (idToken: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/google', { idToken });
    return response.data;
  },
};

// Apartments API
export const apartmentsApi = {
  search: async (params: ApartmentSearchParams): Promise<PagedResult<Apartment>> => {
    const response = await api.get<PagedResult<Apartment>>('/apartments', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Apartment> => {
    const response = await api.get<Apartment>(`/apartments/${id}`);
    return response.data;
  },

  getCities: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/apartments/cities');
    return response.data;
  },

  getMyApartments: async (): Promise<Apartment[]> => {
    const response = await api.get<Apartment[]>('/apartments/my');
    return response.data;
  },

  create: async (data: CreateApartmentDto): Promise<Apartment> => {
    const response = await api.post<Apartment>('/apartments', data);
    return response.data;
  },

  update: async (id: number, data: UpdateApartmentDto): Promise<Apartment> => {
    const response = await api.put<Apartment>(`/apartments/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/apartments/${id}`);
  },
};

// Payments API
export const paymentsApi = {
  createPayment: async (apartmentId: number): Promise<PaymentResponse> => {
    const response = await api.post<PaymentResponse>('/payments/create', { apartmentId });
    return response.data;
  },

  verifyPayment: async (transactionId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>(`/payments/verify/${transactionId}`);
    return response.data;
  },

  simulatePayment: async (apartmentId: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>(`/payments/simulate-payment/${apartmentId}`);
    return response.data;
  },
};

export default api;
