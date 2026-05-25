import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../services/modal-service';
import { PartidasService } from '../../services/partidas-service';

interface Celda {
  fila: number;
  col: number;
  mina: boolean;
  abierta: boolean;
  bandera: boolean;
  vecinas: number;
}

export type Dificultad = 'facil' | 'medio' | 'dificil';

interface Config {
  filas: number;
  cols: number;
  minas: number;
}

const CONFIGS: Record<Dificultad, Config> = {
  facil:   { filas: 8,  cols: 8,  minas: 10 },
  medio:   { filas: 10, cols: 10, minas: 18 },
  dificil: { filas: 12, cols: 12, minas: 30 }
};

type Estado = 'jugando' | 'ganado' | 'perdido';

@Component({
  selector: 'app-buscaminas',
  imports: [RouterLink],
  templateUrl: './buscaminas.html',
  styleUrl: './buscaminas.scss'
})
export class Buscaminas implements OnInit, OnDestroy {
  private readonly partidas = inject(PartidasService);
  private readonly modal = inject(ModalService);

  readonly dificultades: Dificultad[] = ['facil', 'medio', 'dificil'];
  readonly dificultad = signal<Dificultad>('facil');
  readonly tablero = signal<Celda[][]>([]);
  readonly estado = signal<Estado>('jugando');
  readonly banderas = signal(0);
  readonly tiempo = signal(0);
  readonly iniciado = signal(false);

  private timerId: ReturnType<typeof setInterval> | null = null;
  private inicio = 0;
  private guardada = false;

  readonly minasRestantes = computed(() => Math.max(0, this.configActual().minas - this.banderas()));
  readonly configActual = computed(() => CONFIGS[this.dificultad()]);

  ngOnInit(): void {
    this.nuevaPartida();
  }

  ngOnDestroy(): void {
    this.detenerTimer();
  }

  nuevaPartida(): void {
    this.detenerTimer();
    const { filas, cols } = this.configActual();
    const grilla: Celda[][] = [];
    for (let f = 0; f < filas; f++) {
      const fila: Celda[] = [];
      for (let c = 0; c < cols; c++) {
        fila.push({ fila: f, col: c, mina: false, abierta: false, bandera: false, vecinas: 0 });
      }
      grilla.push(fila);
    }
    this.tablero.set(grilla);
    this.estado.set('jugando');
    this.banderas.set(0);
    this.tiempo.set(0);
    this.iniciado.set(false);
    this.guardada = false;
  }

  cambiarDificultad(d: Dificultad): void {
    this.dificultad.set(d);
    this.nuevaPartida();
  }

  abrir(celda: Celda): void {
    if (this.estado() !== 'jugando' || celda.abierta || celda.bandera) return;

    if (!this.iniciado()) {
      this.colocarMinas(celda.fila, celda.col);
      this.iniciarTimer();
      this.iniciado.set(true);
    }

    const grilla = this.copiarTablero();
    const target = grilla[celda.fila][celda.col];

    if (target.mina) {
      this.revelarMinas(grilla);
      this.tablero.set(grilla);
      this.estado.set('perdido');
      this.detenerTimer();
      void this.guardar();
      return;
    }

    this.abrirRecursivo(grilla, target.fila, target.col);
    this.tablero.set(grilla);

    if (this.todoLimpio(grilla)) {
      this.estado.set('ganado');
      this.detenerTimer();
      void this.guardar();
    }
  }

  alternarBandera(event: Event, celda: Celda): void {
    event.preventDefault();
    if (this.estado() !== 'jugando' || celda.abierta) return;

    const grilla = this.copiarTablero();
    const target = grilla[celda.fila][celda.col];
    target.bandera = !target.bandera;
    this.tablero.set(grilla);
    this.banderas.update(n => n + (target.bandera ? 1 : -1));
  }

  contenido(c: Celda): string {
    if (c.bandera) return 'F';
    if (!c.abierta) return '';
    if (c.mina) return '*';
    return c.vecinas > 0 ? String(c.vecinas) : '';
  }

  claseCelda(c: Celda): string {
    if (c.bandera && !c.abierta) return 'bm-bandera';
    if (!c.abierta) return 'bm-cerrada';
    if (c.mina) return 'bm-mina';
    return `bm-abierta bm-n${c.vecinas}`;
  }

  formatTiempo(): string {
    const t = this.tiempo();
    const m = Math.floor(t / 60).toString().padStart(2, '0');
    const s = (t % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  private copiarTablero(): Celda[][] {
    return this.tablero().map(fila => fila.map(c => ({ ...c })));
  }

  private colocarMinas(fSafe: number, cSafe: number): void {
    const grilla = this.copiarTablero();
    const { filas, cols, minas } = this.configActual();
    let restantes = minas;
    while (restantes > 0) {
      const f = Math.floor(Math.random() * filas);
      const c = Math.floor(Math.random() * cols);
      if ((f === fSafe && c === cSafe) || grilla[f][c].mina) continue;
      grilla[f][c].mina = true;
      restantes--;
    }
    for (let f = 0; f < filas; f++) {
      for (let c = 0; c < cols; c++) {
        if (grilla[f][c].mina) continue;
        let n = 0;
        for (let df = -1; df <= 1; df++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (df === 0 && dc === 0) continue;
            const nf = f + df, nc = c + dc;
            if (nf < 0 || nc < 0 || nf >= filas || nc >= cols) continue;
            if (grilla[nf][nc].mina) n++;
          }
        }
        grilla[f][c].vecinas = n;
      }
    }
    this.tablero.set(grilla);
  }

  private abrirRecursivo(grilla: Celda[][], f: number, c: number): void {
    const { filas, cols } = this.configActual();
    if (f < 0 || c < 0 || f >= filas || c >= cols) return;
    const celda = grilla[f][c];
    if (celda.abierta || celda.bandera || celda.mina) return;
    celda.abierta = true;
    if (celda.vecinas > 0) return;
    for (let df = -1; df <= 1; df++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (df === 0 && dc === 0) continue;
        this.abrirRecursivo(grilla, f + df, c + dc);
      }
    }
  }

  private revelarMinas(grilla: Celda[][]): void {
    for (const fila of grilla) {
      for (const c of fila) {
        if (c.mina) c.abierta = true;
      }
    }
  }

  private todoLimpio(grilla: Celda[][]): boolean {
    for (const fila of grilla) {
      for (const c of fila) {
        if (!c.mina && !c.abierta) return false;
      }
    }
    return true;
  }

  private iniciarTimer(): void {
    this.inicio = Date.now();
    this.timerId = setInterval(() => {
      this.tiempo.set(Math.floor((Date.now() - this.inicio) / 1000));
    }, 250);
  }

  private detenerTimer(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private async guardar(): Promise<void> {
    if (this.guardada) return;
    this.guardada = true;
    const gano = this.estado() === 'ganado';
    const tiempo = this.tiempo();
    const cfg = this.configActual();
    // Puntaje: si gana, bonus por dificultad menos tiempo. Si pierde, 0.
    const bonus = cfg.minas * 10 + cfg.filas * cfg.cols;
    const puntaje = gano ? Math.max(0, bonus - tiempo) : 0;
    try {
      await this.partidas.guardar({
        juego: 'buscaminas',
        gano,
        puntaje,
        datos: {
          dificultad: this.dificultad(),
          tiempo_segundos: tiempo,
          filas: cfg.filas,
          cols: cfg.cols,
          minas: cfg.minas
        }
      });
    } catch (e: any) {
      this.modal.error(e?.message ?? 'No se pudo guardar el resultado.', 'Atencion');
    }
  }
}
