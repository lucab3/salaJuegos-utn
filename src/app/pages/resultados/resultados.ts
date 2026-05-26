import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../services/modal-service';
import { JuegoId, PartidasService, RankingFila } from '../../services/partidas-service';

interface TablaJuego {
  juego: JuegoId;
  titulo: string;
  icono: string;
  detalleCol: string;
  filas: RankingFila[];
  cargando: boolean;
}

@Component({
  selector: 'app-resultados',
  imports: [RouterLink],
  templateUrl: './resultados.html',
  styleUrl: './resultados.scss'
})
export class Resultados implements OnInit {
  private readonly partidas = inject(PartidasService);
  private readonly modal = inject(ModalService);

  readonly tablas = signal<TablaJuego[]>([
    { juego: 'ahorcado',    titulo: 'Ahorcado',       icono: 'bi-alphabet',        detalleCol: 'Palabra / fallos',  filas: [], cargando: true },
    { juego: 'mayor-menor', titulo: 'Mayor o Menor',  icono: 'bi-suit-spade',      detalleCol: 'Aciertos / errores', filas: [], cargando: true },
    { juego: 'preguntados', titulo: 'Preguntados',    icono: 'bi-question-circle', detalleCol: 'Correctas',          filas: [], cargando: true },
    { juego: 'buscaminas',  titulo: 'Buscaminas',     icono: 'bi-flag-fill',       detalleCol: 'Dificultad / tiempo', filas: [], cargando: true }
  ]);

  ngOnInit(): void {
    void this.cargarTodo();
  }

  async cargarTodo(): Promise<void> {
    const lista = this.tablas();
    await Promise.all(lista.map((_, i) => this.cargarUna(i)));
  }

  private async cargarUna(idx: number): Promise<void> {
    const actual = this.tablas();
    try {
      const filas = await this.partidas.ranking(actual[idx].juego, 10);
      this.actualizarTabla(idx, { filas, cargando: false });
    } catch (e: any) {
      this.modal.error(e?.message ?? 'No se pudo cargar el ranking.', 'Resultados');
      this.actualizarTabla(idx, { cargando: false });
    }
  }

  private actualizarTabla(idx: number, patch: Partial<TablaJuego>): void {
    const lista = this.tablas().map((t, i) => i === idx ? { ...t, ...patch } : t);
    this.tablas.set(lista);
  }

  nombreJugador(f: RankingFila): string {
    if (!f.usuario) return 'Anónimo';
    const n = `${f.usuario.nombre} ${f.usuario.apellido}`.trim();
    return n || f.usuario.email;
  }

  detalle(juego: JuegoId, f: RankingFila): string {
    const d = f.datos ?? {};
    switch (juego) {
      case 'ahorcado':
        return `${(d['palabra'] as string) ?? '?'} (${(d['fallos'] as number) ?? '?'} fallos)`;
      case 'mayor-menor':
        return `${(d['aciertos'] as number) ?? '?'} aciertos / ${(d['errores'] as number) ?? '?'} errores`;
      case 'preguntados':
        return `${(d['correctas'] as number) ?? '?'} / ${(d['total'] as number) ?? '?'}`;
      case 'buscaminas': {
        const dif = (d['dificultad'] as string) ?? '?';
        const seg = (d['tiempo_segundos'] as number) ?? 0;
        const m = Math.floor(seg / 60).toString().padStart(2, '0');
        const s = (seg % 60).toString().padStart(2, '0');
        return `${dif} - ${m}:${s}`;
      }
    }
  }

  formatFecha(iso: string): string {
    return new Date(iso).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
  }
}
