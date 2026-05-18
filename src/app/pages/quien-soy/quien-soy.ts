import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { GithubService, GithubUser } from '../../services/github-service';

@Component({
  selector: 'app-quien-soy',
  imports: [DatePipe],
  templateUrl: './quien-soy.html',
  styleUrl: './quien-soy.scss'
})
export class QuienSoy implements OnInit {
  private readonly github = inject(GithubService);

  readonly username = 'lucab3';
  readonly nombreCompleto = 'Luca Belotti';
  readonly carrera = 'Tecnicatura Universitaria en Programación — UTN Avellaneda';
  readonly materia = 'Programación IV · 4° Cuatrimestre · 2026';

  readonly user = signal<GithubUser | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.github.getUser(this.username).subscribe({
      next: (data) => {
        this.user.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los datos desde GitHub. Probá recargar la página.');
        this.loading.set(false);
      }
    });
  }
}
