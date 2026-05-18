import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/navbar/navbar';
import { Modal } from './shared/modal/modal';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Modal],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = 'Sala de Juegos';
  protected readonly year = new Date().getFullYear();
}
