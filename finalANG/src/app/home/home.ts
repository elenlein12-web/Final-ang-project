import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  favoriteRooms: any[] = [];
  errorMessage = '';
  apiResponse: any;
  isLoading = true;

  constructor(private api: ApiService) { }

  async ngOnInit(): Promise<void> {
    try {
      const data = await this.api.getHotel(1);
      this.apiResponse = data;
      this.favoriteRooms = this.getRoomsFromResponse(data).slice(0, 6);
    } catch (error) {
      console.error(error);
      this.errorMessage = 'Unable to load featured rooms.';
    } finally {
      this.isLoading = false;
    }
  }

  selectRoom(room: any): void {
    sessionStorage.setItem('selectedRoomId', room.id?.toString() ?? '');
    sessionStorage.setItem('selectedRoomName', room.name ?? '');
  }

  private getRoomsFromResponse(response: any): any[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.rooms)) {
      return response.rooms;
    }

    if (Array.isArray(response?.data?.rooms)) {
      return response.data.rooms;
    }

    if (Array.isArray(response?.value)) {
      return response.value;
    }

    return [];
  }
}
