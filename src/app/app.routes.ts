import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home').then(m => m.Home),
    title: 'Sala de Juegos | Home'
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login').then(m => m.Login),
    title: 'Sala de Juegos | Login'
  },
  {
    path: 'registro',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/registro/registro').then(m => m.Registro),
    title: 'Sala de Juegos | Registro'
  },
  {
    path: 'quien-soy',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/quien-soy/quien-soy').then(m => m.QuienSoy),
    title: 'Sala de Juegos | Quién Soy'
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
