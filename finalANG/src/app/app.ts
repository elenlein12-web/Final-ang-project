import { Component, OnInit } from '@angular/core';
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
export class App implements OnInit {
  navOpen = false;
  darkMode = false;

  constructor(public auth: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.darkMode = localStorage.getItem('darkMode') === 'enabled';
    document.body.classList.toggle('dark-mode', this.darkMode);
  }

  toggleNav(): void {
    this.navOpen = !this.navOpen;
  }

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    document.body.classList.toggle('dark-mode', this.darkMode);
    localStorage.setItem('darkMode', this.darkMode ? 'enabled' : 'disabled');
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
