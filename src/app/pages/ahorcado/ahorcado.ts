import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../services/modal-service';
import { PartidasService } from '../../services/partidas-service';

type Estado = 'jugando' | 'ganado' | 'perdido';

const PALABRAS = [
  'ANGULAR', 'TYPESCRIPT', 'SUPABASE', 'BOOTSTRAP', 'JAVASCRIPT',
  'COMPONENTE', 'SERVICIO', 'OBSERVABLE', 'PROMESA', 'SIGNAL',
  'ROUTER', 'GUARDIAN', 'FORMULARIO', 'PIPE', 'DIRECTIVA',
  'AVELLANEDA', 'TECNICATURA', 'PROGRAMACION', 'INTERFAZ', 'MODULO',
  'ARGENTINA', 'BUENOS AIRES', 'BANDERA', 'FUTBOL', 'ASADO',
  'MATE', 'TANGO', 'PAMPA', 'CORDILLERA', 'PATAGONIA'
];

const MAX_FALLOS = 6;

@Component({
  selector: 'app-ahorcado',
  imports: [RouterLink],
  templateUrl: './ahorcado.html',
  styleUrl: './ahorcado.scss'
})
export class Ahorcado implements OnInit {
  private readonly partidas = inject(PartidasService);
  private readonly modal = inject(ModalService);

  readonly letras: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  private readonly _palabra = signal<string>('');
  private readonly _adivinadas = signal<Set<string>>(new Set());
  private readonly _fallos = signal<number>(0);
  private readonly _estado = signal<Estado>('jugando');
  private readonly _guardada = signal(false);

  readonly palabra = this._palabra.asReadonly();
  readonly fallos = this._fallos.asReadonly();
  readonly estado = this._estado.asReadonly();
  readonly maxFallos = MAX_FALLOS;

  readonly palabraVisible = computed(() => {
    const p = this._palabra();
    const adi = this._adivinadas();
    return p.split('').map(ch => {
      if (ch === ' ') return ' ';
      if (this._estado() === 'perdido') return ch;
      return adi.has(ch) ? ch : '_';
    });
  });

  readonly letrasIncorrectas = computed(() => {
    const arr: string[] = [];
    const palabra = this._palabra();
    for (const l of this._adivinadas()) {
      if (!palabra.includes(l)) arr.push(l);
    }
    return arr.sort();
  });

  ngOnInit(): void {
    this.nuevaPartida();
  }

  nuevaPartida(): void {
    const palabra = PALABRAS[Math.floor(Math.random() * PALABRAS.length)];
    this._palabra.set(palabra);
    this._adivinadas.set(new Set());
    this._fallos.set(0);
    this._estado.set('jugando');
    this._guardada.set(false);
  }

  yaUsada(letra: string): boolean {
    return this._adivinadas().has(letra);
  }

  esCorrecta(letra: string): boolean {
    return this._adivinadas().has(letra) && this._palabra().includes(letra);
  }

  esIncorrecta(letra: string): boolean {
    return this._adivinadas().has(letra) && !this._palabra().includes(letra);
  }

  async elegir(letra: string): Promise<void> {
    if (this._estado() !== 'jugando') return;
    if (this.yaUsada(letra)) return;

    const set = new Set(this._adivinadas());
    set.add(letra);
    this._adivinadas.set(set);

    const palabra = this._palabra();
    if (!palabra.includes(letra)) {
      this._fallos.update(n => n + 1);
    }

    this.actualizarEstado();
    if (this._estado() !== 'jugando' && !this._guardada()) {
      this._guardada.set(true);
      await this.guardar();
    }
  }

  private actualizarEstado(): void {
    const palabra = this._palabra();
    const adi = this._adivinadas();
    const todas = palabra.split('').every(ch => ch === ' ' || adi.has(ch));
    if (todas) {
      this._estado.set('ganado');
      return;
    }
    if (this._fallos() >= MAX_FALLOS) {
      this._estado.set('perdido');
    }
  }

  private async guardar(): Promise<void> {
    const gano = this._estado() === 'ganado';
    const puntaje = gano ? Math.max(0, (MAX_FALLOS - this._fallos()) * 10) : 0;
    try {
      await this.partidas.guardar({
        juego: 'ahorcado',
        gano,
        puntaje,
        datos: {
          palabra: this._palabra(),
          fallos: this._fallos(),
          letras_intentadas: Array.from(this._adivinadas()).sort()
        }
      });
    } catch (e: any) {
      this.modal.error(e?.message ?? 'No se pudo guardar el resultado.', 'Atencion');
    }
  }
}
