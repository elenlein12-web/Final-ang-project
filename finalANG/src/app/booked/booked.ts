import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api';

interface Booking {
  id: number;
  apiId?: number;
  roomId: number;
  roomName: string;
  roomPrice: number;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  totalPrice: number;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  bookingDate: string;
}
@Component({
  selector: 'app-booked',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booked.html',
  styleUrl: './booked.css'
})
export class BookedComponent implements OnInit {
  rooms: any[] = [];
  bookings: Booking[] = [];
  selectedRoomId = '';
  bookingModel = {
    roomId: '',
    checkInDate: '',
    checkOutDate: '',
    clientName: '',
    clientPhone: '',
    clientEmail: ''
  };
  successMessage = '';
  errorMessage = '';

  constructor(private api: ApiService) { }

  async ngOnInit(): Promise<void> {
    await this.loadRooms();
    this.loadBookings();
    const selectedRoomId = sessionStorage.getItem('selectedRoomId');
    if (selectedRoomId) {
      this.bookingModel.roomId = selectedRoomId;
      this.selectedRoomId = selectedRoomId;
      sessionStorage.removeItem('selectedRoomId');
    }
  }

  async loadRooms(): Promise<void> {
    try {
      const data = await this.api.getHotel(1);
      this.rooms = data?.rooms ?? [];
    } catch (error) {
      this.errorMessage = 'Failed to load rooms.';
      console.error(error);
    }
  }

  loadBookings(): void {
    const stored = localStorage.getItem('hotelBookings');
    this.bookings = stored ? JSON.parse(stored) : [];
  }

  saveBookings(): void {
    localStorage.setItem('hotelBookings', JSON.stringify(this.bookings));
  }

  async book(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    const room = this.rooms.find((item) => item.id?.toString() === this.bookingModel.roomId);
    if (!room) {
      this.errorMessage = 'Please select a valid room.';
      return;
    }

    if (!this.bookingModel.checkInDate || !this.bookingModel.checkOutDate) {
      this.errorMessage = 'Please select check-in and check-out dates.';
      return;
    }

    if (!this.bookingModel.clientName || !this.bookingModel.clientPhone) {
      this.errorMessage = 'Please enter your name and phone number.';
      return;
    }

    const checkIn = new Date(this.bookingModel.checkInDate);
    const checkOut = new Date(this.bookingModel.checkOutDate);
    if (checkOut <= checkIn) {
      this.errorMessage = 'Check-out date must be after check-in date.';
      return;
    }

    const roomConflict = this.bookings.some((booking) =>
      booking.roomId === room.id &&
      !(new Date(this.bookingModel.checkOutDate) <= new Date(booking.checkInDate) ||
        new Date(this.bookingModel.checkInDate) >= new Date(booking.checkOutDate))
    );

    if (roomConflict) {
      this.errorMessage = 'This room is already booked for the selected dates.';
      return;
    }

    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = (room.pricePerNight ?? 0) * nights;

    const booking: Booking = {
      id: Date.now(),
      roomId: room.id,
      roomName: room.name,
      roomPrice: room.pricePerNight ?? 0,
      checkInDate: this.bookingModel.checkInDate,
      checkOutDate: this.bookingModel.checkOutDate,
      nights,
      totalPrice,
      clientName: this.bookingModel.clientName,
      clientPhone: this.bookingModel.clientPhone,
      clientEmail: this.bookingModel.clientEmail,
      bookingDate: new Date().toLocaleDateString('ka-GE')
    };

    const apiPayload = {
      roomID: Number(room.id),
      checkInDate: new Date(this.bookingModel.checkInDate + 'T00:00:00').toISOString(),
      checkOutDate: new Date(this.bookingModel.checkOutDate + 'T23:59:59').toISOString(),
      totalPrice,
      isConfirmed: true,
      customerName: this.bookingModel.clientName,
      customerId: this.bookingModel.clientEmail || null,
      customerPhone: this.bookingModel.clientPhone
    };

    try {
      const result = await this.api.createBooking(apiPayload);
      if (result?.id) {
        booking.apiId = result.id;
      }
    } catch (error) {
      console.warn('Failed to save booking to API, using local storage only.', error);
    }

    this.bookings.push(booking);
    this.saveBookings();
    this.successMessage = `Booking confirmed! Total: $${totalPrice}`;
    this.bookingModel = {
      roomId: '',
      checkInDate: '',
      checkOutDate: '',
      clientName: '',
      clientPhone: '',
      clientEmail: ''
    };
    this.loadBookings();
  }

  cancelBooking(id: number): void {
    this.bookings = this.bookings.filter((booking) => booking.id !== id);
    this.saveBookings();
  }
}
