import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { HotelsComponent } from './hotel/hotel';
import { RoomsComponent } from './rooms/rooms';
import { BookedComponent } from './booked/booked';
import { LoginComponent } from './login/login';
import { RegisterComponent } from './register/register';
import { AiComponent } from './ai/ai';
export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'hotels', component: HotelsComponent },
    { path: 'rooms', component: RoomsComponent },
    { path: 'booked', component: BookedComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'ai', component: AiComponent },
    { path: '**', redirectTo: '' }
];
