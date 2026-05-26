import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../services/modal-service';
import { PartidasService } from '../../services/partidas-service';
import { Pregunta, TriviaService } from '../../services/trivia-service';

type Estado = 'cargando' | 'jugando' | 'mostrando' | 'terminado' | 'error';

@Component({
  selector: 'app-preguntados',
  imports: [RouterLink],
  templateUrl: './preguntados.html',
  styleUrl: './preguntados.scss'
})
export class Preguntados implements OnInit {
  private readonly trivia = inject(TriviaService);
  private readonly partidas = inject(PartidasService);
  private readonly modal = inject(ModalService);

  readonly preguntas = signal<Pregunta[]>([]);
  readonly indice = signal(0);
  readonly seleccionada = signal<string | null>(null);
  readonly puntaje = signal(0);
  readonly correctas = signal(0);
  readonly estado = signal<Estado>('cargando');
  readonly mensajeError = signal<string | null>(null);
  private guardada = false;

  readonly preguntaActual = computed(() => this.preguntas()[this.indice()] ?? null);
  readonly total = computed(() => this.preguntas().length);
  readonly progreso = computed(() => {
    const t = this.total();
    if (t === 0) return 0;
    return Math.round(((this.indice() + (this.estado() === 'terminado' ? 1 : 0)) / t) * 100);
  });

  ngOnInit(): void {
    void this.nuevaPartida();
  }

  async nuevaPartida(): Promise<void> {
    this.estado.set('cargando');
    this.mensajeError.set(null);
    this.preguntas.set([]);
    this.indice.set(0);
    this.seleccionada.set(null);
    this.puntaje.set(0);
    this.correctas.set(0);
    this.guardada = false;

    try {
      const lista = await this.trivia.obtenerPreguntas(10);
      this.preguntas.set(lista);
      this.estado.set('jugando');
    } catch (e: any) {
      this.mensajeError.set(e?.message ?? 'No se pudo cargar la trivia.');
      this.estado.set('error');
    }
  }

  esCorrecta(opcion: string): boolean {
    const p = this.preguntaActual();
    return !!p && opcion === p.correcta;
  }

  yaContestada(): boolean {
    return this.estado() === 'mostrando' || this.estado() === 'terminado';
  }

  claseOpcion(opcion: string): string {
    if (!this.yaContestada()) return 'btn-outline-primary';
    if (this.esCorrecta(opcion)) return 'btn-success';
    if (opcion === this.seleccionada()) return 'btn-danger';
    return 'btn-outline-secondary';
  }

  async elegir(opcion: string): Promise<void> {
    if (this.estado() !== 'jugando') return;
    this.seleccionada.set(opcion);
    this.estado.set('mostrando');

    const correcta = this.esCorrecta(opcion);
    if (correcta) {
      this.correctas.update(n => n + 1);
      this.puntaje.update(n => n + this.puntosDificultad());
    }

    setTimeout(() => this.avanzar(), 1200);
  }

  private avanzar(): void {
    const proximo = this.indice() + 1;
    if (proximo >= this.total()) {
      this.estado.set('terminado');
      void this.guardar();
      return;
    }
    this.indice.set(proximo);
    this.seleccionada.set(null);
    this.estado.set('jugando');
  }

  private puntosDificultad(): number {
    const d = this.preguntaActual()?.dificultad;
    if (d === 'hard') return 30;
    if (d === 'medium') return 20;
    return 10;
  }

  private async guardar(): Promise<void> {
    if (this.guardada) return;
    this.guardada = true;
    try {
      await this.partidas.guardar({
        juego: 'preguntados',
        gano: this.correctas() >= Math.ceil(this.total() / 2),
        puntaje: this.puntaje(),
        datos: {
          correctas: this.correctas(),
          total: this.total()
        }
      });
    } catch (e: any) {
      this.modal.error(e?.message ?? 'No se pudo guardar el resultado.', 'Atencion');
    }
  }
}
