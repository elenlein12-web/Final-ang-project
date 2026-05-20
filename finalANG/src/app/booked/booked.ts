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
  localOnly?: boolean;
}

interface BookingPostPayload {
  id: number;
  roomID: number;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  isConfirmed: boolean;
  customerName: string;
  customerId: string;
  customerPhone: string;
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
  isBooking = false;
  selectedRoomId = '';
  bookingModel = {
    roomId: '',
    checkInDate: '',
    checkOutDate: '',
    clientName: '',
    clientPhone: '',
    customerId: ''
  };
  successMessage = '';
  errorMessage = '';
  private allApiBookings: any[] = [];
  private readonly localBookingsKey = 'localBookings';

  constructor(private api: ApiService, private auth: AuthService) { }

  async ngOnInit(): Promise<void> {
    await this.loadRooms();
    this.bookingModel.clientPhone = this.auth.userPhone;
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
      const localBookings = this.getLocalBookings();
      const phone = this.normalizePhone(this.bookingModel.clientPhone || this.auth.userPhone);
      this.bookings = [...this.allApiBookings, ...localBookings]
        .filter((booking) => phone && this.samePhone(booking.customerPhone, phone))
        .map((booking) => this.mapApiBooking(booking));
    } catch (error) {
      this.errorMessage = 'Failed to load bookings from API.';
      console.error(error);
    }
  }

  async book(): Promise<void> {
    if (this.isBooking) {
      return;
    }

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

    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = (room.pricePerNight ?? 0) * nights;

    const apiPayload = this.buildBookingPayload(room, totalPrice);

    try {
      this.isBooking = true;
      this.successMessage = 'Saving booking...';
      const createdBooking = await this.api.createBooking(apiPayload);
      this.successMessage = `Booking confirmed! Total: $${totalPrice}`;
      const bookedPhone = this.bookingModel.clientPhone;
      this.showSubmittedBooking(createdBooking ?? apiPayload, apiPayload);
      this.bookingModel = {
        roomId: '',
        checkInDate: '',
        checkOutDate: '',
        clientName: '',
        clientPhone: bookedPhone,
        customerId: ''
      };
    } catch (error) {
      if (this.shouldSaveLocalFallback(error)) {
        const localBooking = this.saveLocalBooking(apiPayload);
        this.successMessage = `Booking saved locally. The booking API is unavailable, so it was not saved on the server. Total: $${totalPrice}`;
        const bookedPhone = this.bookingModel.clientPhone;
        this.showSubmittedBooking(localBooking, apiPayload);
        this.bookingModel = {
          roomId: '',
          checkInDate: '',
          checkOutDate: '',
          clientName: '',
          clientPhone: bookedPhone,
          customerId: ''
        };
      } else {
        this.errorMessage = this.getBookingErrorMessage(error);
      }
      console.error(error);
    } finally {
      this.isBooking = false;
    }
  }

  async cancelBooking(id: number): Promise<void> {
    this.errorMessage = '';
    this.successMessage = '';

    const booking = this.bookings.find((item) => item.id === id);
    if (booking?.localOnly) {
      this.deleteLocalBooking(id);
      this.successMessage = 'Local booking cancelled.';
      await this.loadBookings();
      return;
    }

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
      bookingDate: '',
      localOnly: booking.localOnly ?? false
    };
  }

  private showSubmittedBooking(createdBooking: any, fallbackPayload: BookingPostPayload): void {
    const booking = {
      ...fallbackPayload,
      ...createdBooking
    };

    this.bookings = [this.mapApiBooking(booking)];
  }

  private buildBookingPayload(room: any, totalPrice: number): BookingPostPayload {
    return {
      id: 0,
      roomID: Number(room.id),
      checkInDate: this.toApiDate(this.bookingModel.checkInDate),
      checkOutDate: this.toApiDate(this.bookingModel.checkOutDate),
      totalPrice: Math.round(totalPrice),
      isConfirmed: true,
      customerName: this.bookingModel.clientName.trim(),
      customerId: this.bookingModel.customerId.trim(),
      customerPhone: this.bookingModel.clientPhone.trim()
    };
  }

  private samePhone(left: string | null | undefined, right: string | null | undefined): boolean {
    return this.normalizePhone(left) === this.normalizePhone(right);
  }

  private normalizePhone(phone: string | null | undefined): string {
    return (phone ?? '').replace(/\D/g, '');
  }

  private toApiDate(date: string): string {
    return new Date(`${date}T00:00:00.000Z`).toISOString();
  }

  private toInputDate(date: string): string {
    return date?.slice(0, 10) ?? '';
  }

  private shouldSaveLocalFallback(error: any): boolean {
    return error?.name === 'TimeoutError' || error?.status === 0 || error?.status === 504;
  }

  private getBookingErrorMessage(error: any): string {
    if (error?.status === 400) {
      return typeof error.error === 'string'
        ? error.error
        : 'The booking was rejected. Please choose different dates or another room.';
    }

    return 'Failed to save booking to API.';
  }

  private getLocalBookings(): any[] {
    try {
      const saved = localStorage.getItem(this.localBookingsKey);
      const bookings = saved ? JSON.parse(saved) : [];
      return Array.isArray(bookings) ? bookings : [];
    } catch {
      return [];
    }
  }

  private saveLocalBooking(booking: any): any {
    const localBooking = {
      ...booking,
      id: Date.now(),
      localOnly: true
    };
    const bookings = this.getLocalBookings();
    localStorage.setItem(this.localBookingsKey, JSON.stringify([localBooking, ...bookings]));
    return localBooking;
  }

  private deleteLocalBooking(id: number): void {
    const bookings = this.getLocalBookings().filter((booking) => booking.id !== id);
    localStorage.setItem(this.localBookingsKey, JSON.stringify(bookings));
  }
}
