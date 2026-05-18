import { Routes } from '@angular/router';

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
    loadComponent: () => import('./pages/login/login').then(m => m.Login),
    title: 'Sala de Juegos | Login'
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/registro/registro').then(m => m.Registro),
    title: 'Sala de Juegos | Registro'
  },
  {
    path: 'quien-soy',
    loadComponent: () => import('./pages/quien-soy/quien-soy').then(m => m.QuienSoy),
    title: 'Sala de Juegos | Quién Soy'
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
