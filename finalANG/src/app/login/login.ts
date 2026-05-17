import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  phone = '';
  password = '';
  message = '';
  messageColor = 'black';

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private router: Router
  ) { }

  async login(): Promise<void> {
    this.message = 'Logging in...';
    this.messageColor = 'blue';

    try {
      const body = {
        phoneNumber: this.phone,
        password: this.password,
        role: 'user'
      };

      const data = await firstValueFrom(
        this.http.post<any>('https://rentcar.stepprojects.ge/api/Users/login', body, {
          headers: new HttpHeaders({ 'Content-Type': 'application/json' })
        })
      );

      const token = data?.token || data?.accessToken;
      if (!token) {
        this.message = 'Login failed: token not returned.';
        this.messageColor = 'red';
        return;
      }

      this.auth.login(token, this.phone);
      this.message = 'Login successful!';
      this.messageColor = 'green';
      setTimeout(() => this.router.navigate(['/']), 800);
    } catch (error: any) {
      console.error(error);
      this.message = error?.message || 'Login failed';
      this.messageColor = 'red';
    }
  }
}
