import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api';
import { AuthService } from '../services/auth';

interface Booking {
  id: number;
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
  private allApiBookings: any[] = [];

  constructor(private api: ApiService, private auth: AuthService) { }

  async ngOnInit(): Promise<void> {
    await this.loadRooms();
    this.bookingModel.clientPhone = this.auth.userPhone;
    await this.loadBookings();
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

  async loadBookings(): Promise<void> {
    try {
      this.allApiBookings = await this.api.getBookings();
      const phone = this.normalizePhone(this.bookingModel.clientPhone || this.auth.userPhone);
      this.bookings = this.allApiBookings
        .filter((booking) => phone && this.samePhone(booking.customerPhone, phone))
        .map((booking) => this.mapApiBooking(booking));
    } catch (error) {
      this.errorMessage = 'Failed to load bookings from API.';
      console.error(error);
    }
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
      Number(booking.roomId) === Number(room.id) &&
      !(checkOut <= new Date(booking.checkInDate) || checkIn >= new Date(booking.checkOutDate))
    );

    if (roomConflict) {
      this.errorMessage = 'This room is already booked for the selected dates.';
      return;
    }

    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = (room.pricePerNight ?? 0) * nights;

    const apiPayload = {
      id: 0,
      roomID: Number(room.id),
      checkInDate: this.toApiDate(this.bookingModel.checkInDate),
      checkOutDate: this.toApiDate(this.bookingModel.checkOutDate),
      totalPrice,
      isConfirmed: true,
      customerName: this.bookingModel.clientName,
      customerId: this.bookingModel.clientEmail || '',
      customerPhone: this.bookingModel.clientPhone
    };

    try {
      await this.api.createBooking(apiPayload);
      this.successMessage = `Booking confirmed! Total: $${totalPrice}`;
      const bookedPhone = this.bookingModel.clientPhone;
      await this.loadBookings();
      this.bookingModel = {
        roomId: '',
        checkInDate: '',
        checkOutDate: '',
        clientName: '',
        clientPhone: bookedPhone,
        clientEmail: ''
      };
    } catch (error) {
      this.errorMessage = 'Failed to save booking to API.';
      console.error(error);
    }
  }

  async cancelBooking(id: number): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    try {
      await this.api.deleteBooking(id);
      this.successMessage = 'Booking cancelled.';
      await this.loadBookings();
    } catch (error) {
      this.errorMessage = 'Failed to cancel booking.';
      console.error(error);
    }
  }

  async searchByPhone(): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';
    await this.loadBookings();
  }

  private mapApiBooking(booking: any): Booking {
    const room = this.rooms.find((item) => Number(item.id) === Number(booking.roomID));
    const checkInDate = this.toInputDate(booking.checkInDate);
    const checkOutDate = this.toInputDate(booking.checkOutDate);
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.max(0, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      id: booking.id,
      roomId: booking.roomID,
      roomName: room?.name ?? `Room #${booking.roomID}`,
      roomPrice: room?.pricePerNight ?? 0,
      checkInDate,
      checkOutDate,
      nights,
      totalPrice: booking.totalPrice ?? 0,
      clientName: booking.customerName ?? '',
      clientPhone: booking.customerPhone ?? '',
      clientEmail: booking.customerId ?? '',
      bookingDate: ''
    };
  }

  private samePhone(left: string | null | undefined, right: string | null | undefined): boolean {
    return this.normalizePhone(left) === this.normalizePhone(right);
  }

  private normalizePhone(phone: string | null | undefined): string {
    return (phone ?? '').replace(/\D/g, '');
  }

  private toApiDate(date: string): string {
    return `${date}T00:00:00`;
  }

  private toInputDate(date: string): string {
    return date?.slice(0, 10) ?? '';
  }
}
