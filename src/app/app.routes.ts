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
    path: 'ahorcado',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/ahorcado/ahorcado').then(m => m.Ahorcado),
    title: 'Sala de Juegos | Ahorcado'
  },
  {
    path: 'mayor-menor',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/mayor-menor/mayor-menor').then(m => m.MayorMenor),
    title: 'Sala de Juegos | Mayor o Menor'
  },
  {
    path: 'chat',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/chat/chat').then(m => m.Chat),
    title: 'Sala de Juegos | Chat'
  },
  {
    path: 'preguntados',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/preguntados/preguntados').then(m => m.Preguntados),
    title: 'Sala de Juegos | Preguntados'
  },
  {
    path: 'buscaminas',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/buscaminas/buscaminas').then(m => m.Buscaminas),
    title: 'Sala de Juegos | Buscaminas'
  },
  {
    path: 'resultados',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/resultados/resultados').then(m => m.Resultados),
    title: 'Sala de Juegos | Resultados'
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
