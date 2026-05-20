import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  navOpen = false;

  constructor(public auth: AuthService, private router: Router) { }

  toggleNav(): void {
    this.navOpen = !this.navOpen;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
