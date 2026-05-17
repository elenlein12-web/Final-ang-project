import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rooms.html',
  styleUrls: ['./rooms.css']
})
export class RoomsComponent implements OnInit {
  allRooms: any[] = [];
  rooms: any[] = [];
  search = '';
  sort = 'default';
  minPrice = 0;
  maxPrice = 0;
  errorMessage = '';

  constructor(private api: ApiService, private router: Router) { }

  async ngOnInit(): Promise<void> {
    try {
      const data = await this.api.getHotel(1);
      this.allRooms = data?.rooms ?? [];
      this.rooms = [...this.allRooms];
    } catch (error) {
      this.errorMessage = 'Failed to load rooms.';
      console.error(error);
    }
  }

  searchRooms(): void {
    const query = this.search.trim().toLowerCase();
    this.rooms = this.allRooms.filter((room) => room.name?.toLowerCase().includes(query));
    this.applySort();
  }

  applySort(): void {
    if (this.sort === 'asc') {
      this.rooms.sort((a, b) => (a.pricePerNight ?? 0) - (b.pricePerNight ?? 0));
    } else if (this.sort === 'desc') {
      this.rooms.sort((a, b) => (b.pricePerNight ?? 0) - (a.pricePerNight ?? 0));
    }
  }

  filterByPrice(): void {
    const min = this.minPrice || 0;
    const max = this.maxPrice || Number.MAX_SAFE_INTEGER;
    this.rooms = this.allRooms.filter((room) => {
      const price = room.pricePerNight ?? 0;
      return price >= min && price <= max;
    });
    this.applySort();
  }

  resetFilters(): void {
    this.search = '';
    this.sort = 'default';
    this.minPrice = 0;
    this.maxPrice = 0;
    this.rooms = [...this.allRooms];
  }

  bookRoom(room: any): void {
    sessionStorage.setItem('selectedRoomId', room.id?.toString() ?? '');
    sessionStorage.setItem('selectedRoomName', room.name ?? '');
    this.router.navigate(['/booked']);
  }
}
