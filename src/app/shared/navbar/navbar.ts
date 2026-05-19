import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { ModalService } from '../../services/modal-service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {
  protected readonly auth = inject(AuthService);
  private readonly modal = inject(ModalService);

  async cerrarSesion(): Promise<void> {
    await this.auth.signOut();
    this.modal.info('Sesión cerrada. ¡Hasta la próxima!', 'Listo');
  }
}
