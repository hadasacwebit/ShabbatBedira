export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Apartment {
  id: number;
  title: string;
  description: string;
  address: string;
  city: string;
  pricePerNight: number;
  numberOfBeds: number;
  numberOfRooms: number;
  imageUrl?: string;
  contactPhone?: string;
  isActive: boolean;
  createdAt: string;
  userId: number;
  ownerName: string;
}

export interface CreateApartmentDto {
  title: string;
  description: string;
  address: string;
  city: string;
  pricePerNight: number;
  numberOfBeds: number;
  numberOfRooms: number;
  imageUrl?: string;
  contactPhone?: string;
}

export interface UpdateApartmentDto {
  title?: string;
  description?: string;
  address?: string;
  city?: string;
  pricePerNight?: number;
  numberOfBeds?: number;
  numberOfRooms?: number;
  imageUrl?: string;
  contactPhone?: string;
  isActive?: boolean;
}

export interface ApartmentSearchParams {
  query?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  maxBeds?: number;
  minRooms?: number;
  maxRooms?: number;
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  transactionId?: string;
  errorMessage?: string;
}
