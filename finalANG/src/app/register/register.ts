import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  fullName = '';
  phone = '';
  email = '';
  password = '';
  confirmPassword = '';
  message = '';
  messageColor = 'black';

  constructor(private http: HttpClient, private router: Router) { }

  async register(): Promise<void> {
    this.message = '';

    if (this.password !== this.confirmPassword) {
      this.message = 'Passwords do not match';
      this.messageColor = 'red';
      return;
    }

    const nameParts = this.fullName.trim().split(' ');
    const firstName = nameParts[0] ?? '';
    const lastName = nameParts.slice(1).join(' ') ?? '';

    const payload = {
      firstName,
      lastName,
      phoneNumber: this.phone,
      email: this.email,
      password: this.password,
      role: 'user'
    };

    try {
      const data = await firstValueFrom(
        this.http.post<any>('https://rentcar.stepprojects.ge/api/Users/register', payload, {
          headers: new HttpHeaders({ 'Content-Type': 'application/json' })
        })
      );

      this.message = 'Registered successfully. Redirecting to login...';
      this.messageColor = 'green';
      setTimeout(() => this.router.navigate(['/login']), 1200);
    } catch (error: any) {
      console.error(error);
      this.message = error?.message || 'Registration failed';
      this.messageColor = 'red';
    }
  }
}
