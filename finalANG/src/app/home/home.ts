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

  constructor(private api: ApiService) { }

  async ngOnInit(): Promise<void> {
    try {
      const data = await this.api.getHotel(1);
      this.favoriteRooms = data?.rooms?.slice(0, 6) ?? [];
    } catch (error) {
      console.error(error);
      this.errorMessage = 'Unable to load featured rooms.';
    }
  }

  selectRoom(room: any): void {
    sessionStorage.setItem('selectedRoomId', room.id?.toString() ?? '');
    sessionStorage.setItem('selectedRoomName', room.name ?? '');
  }

}
