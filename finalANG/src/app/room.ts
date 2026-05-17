import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  private apiUrl = 'https://hotelbooking.stepprojects.ge/api/rooms/favorite';
  constructor(private http: HttpClient) { }

  async getFavoriteRooms(): Promise<any> {
    return firstValueFrom(this.http.get<any>(this.apiUrl));
  }
}