import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  get isLoggedIn(): boolean {
    return !!localStorage.getItem('authToken');
  }

  get userPhone(): string {
    return localStorage.getItem('userPhone') ?? '';
  }

  login(token: string, phone: string): void {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userPhone', phone);
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userPhone');
  }
}
