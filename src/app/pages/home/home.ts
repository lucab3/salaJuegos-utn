import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../services/modal-service';
import { AuthService } from '../../services/auth-service';

interface JuegoCard {
  nombre: string;
  descripcion: string;
  icono: string;
  sprint: number;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  private readonly modal = inject(ModalService);
  protected readonly auth = inject(AuthService);

  readonly juegos: JuegoCard[] = [
    { nombre: 'Ahorcado',      descripcion: 'Adivina la palabra letra por letra.', icono: 'bi-alphabet',    sprint: 3 },
    { nombre: 'Mayor o Menor', descripcion: 'Apostá si la próxima carta es mayor o menor.', icono: 'bi-suit-spade', sprint: 3 },
    { nombre: 'Preguntados',   descripcion: 'Trivia con preguntas desde una API externa.', icono: 'bi-question-circle', sprint: 4 },
    { nombre: 'Buscaminas',    descripcion: 'Mi juego propio. Descubrí las celdas evitando las minas.', icono: 'bi-flag', sprint: 4 }
  ];

  jugarProximamente(juego: JuegoCard): void {
    this.modal.info(
      `${juego.nombre} se libera en el Sprint #${juego.sprint}. Hoy estamos cerrando el Sprint #2 (Auth Supabase + guards + Home condicional).`,
      'Próximamente'
    );
  }

  async cerrarSesion(): Promise<void> {
    await this.auth.signOut();
    this.modal.info('Sesión cerrada. ¡Hasta la próxima!', 'Listo');
  }
}
