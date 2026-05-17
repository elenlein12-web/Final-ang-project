import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-hotels',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './hotel.html',
  styleUrls: ['./hotel.css']
})
export class HotelsComponent implements OnInit {
  hotels: any[] = [];
  filteredHotels: any[] = [];
  cities: string[] = ['all'];
  selectedCity = 'all';
  errorMessage = '';

  constructor(private api: ApiService) { }

  async ngOnInit(): Promise<void> {
    try {
      const hotels = await this.api.getHotels();
      this.hotels = hotels ?? [];
      this.filteredHotels = [...this.hotels];
      this.cities = ['all', ...Array.from(new Set(this.hotels.map((hotel) => hotel.city).filter(Boolean)))];
    } catch (error) {
      this.errorMessage = 'Failed to load hotels.';
      console.error(error);
    }
  }

  filterHotels(): void {
    if (this.selectedCity === 'all') {
      this.filteredHotels = [...this.hotels];
      return;
    }

    this.filteredHotels = this.hotels.filter((hotel) => hotel.city === this.selectedCity);
  }
}
