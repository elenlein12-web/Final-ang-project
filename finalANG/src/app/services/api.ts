import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

const API_BASE = 'https://hotelbooking.stepprojects.ge/api';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) { }

  async getHotel(id: number): Promise<any> {
    return firstValueFrom(this.http.get<any>(`${API_BASE}/Hotels/GetHotel/${id}`));
  }

  async getHotels(): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${API_BASE}/Hotels/GetAll`));
  }

  async getCities(): Promise<string[]> {
    return firstValueFrom(this.http.get<string[]>(`${API_BASE}/Hotels/GetCities`));
  }

  async getRooms(): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${API_BASE}/Rooms/GetAll`));
  }

  async getAvailableRooms(): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${API_BASE}/Rooms/GetAvailableRooms`));
  }

  async getRoomTypes(): Promise<any[]> {
    return firstValueFrom(this.http.get<any[]>(`${API_BASE}/Rooms/GetRoomTypes`));
  }

  async createBooking(payload: any): Promise<any> {
    return firstValueFrom(this.http.post<any>(`${API_BASE}/Booking`, payload));
  }

  async getBookings(): Promise<any[]> {
    const response = await firstValueFrom(this.http.get<any>(`${API_BASE}/Booking`));
    return Array.isArray(response) ? response : response?.value ?? [];
  }

  async deleteBooking(bookingId: number): Promise<any> {
    return firstValueFrom(this.http.delete<any>(`${API_BASE}/Booking/${bookingId}`));
  }
}
