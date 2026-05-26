import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../services/modal-service';
import { PartidasService } from '../../services/partidas-service';

export type Palo = 'oros' | 'copas' | 'espadas' | 'bastos';
export interface Carta {
  valor: number;     // 1..12 (baraja espanola de 48 cartas)
  palo: Palo;
}

const VALORES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const PALOS: Palo[] = ['oros', 'copas', 'espadas', 'bastos'];

function armarMazo(): Carta[] {
  const mazo: Carta[] = [];
  for (const v of VALORES) {
    for (const p of PALOS) {
      mazo.push({ valor: v, palo: p });
    }
  }
  return mazo;
}

function mezclar<T>(arr: T[]): T[] {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

type Resultado = 'jugando' | 'terminado';

@Component({
  selector: 'app-mayor-menor',
  imports: [RouterLink, NgTemplateOutlet],
  templateUrl: './mayor-menor.html',
  styleUrl: './mayor-menor.scss'
})
export class MayorMenor implements OnInit {
  private readonly partidas = inject(PartidasService);
  private readonly modal = inject(ModalService);

  private mazo: Carta[] = [];
  private indice = 0;

  readonly cartaActual = signal<Carta | null>(null);
  readonly cartaSiguiente = signal<Carta | null>(null);
  readonly mostrarSiguiente = signal(false);
  readonly aciertos = signal(0);
  readonly errores = signal(0);
  readonly estado = signal<Resultado>('jugando');
  readonly maxFallos = 3;
  private guardada = false;

  readonly cartasRestantes = computed(() => Math.max(0, this.mazo.length - this.indice - 1));

  ngOnInit(): void {
    this.nuevaPartida();
  }

  nuevaPartida(): void {
    this.mazo = mezclar(armarMazo());
    this.indice = 0;
    this.cartaActual.set(this.mazo[0] ?? null);
    this.cartaSiguiente.set(null);
    this.mostrarSiguiente.set(false);
    this.aciertos.set(0);
    this.errores.set(0);
    this.estado.set('jugando');
    this.guardada = false;
  }

  async apostar(opcion: 'mayor' | 'menor' | 'igual'): Promise<void> {
    if (this.estado() !== 'jugando') return;
    if (this.mostrarSiguiente()) return;

    const actual = this.cartaActual();
    const siguiente = this.mazo[this.indice + 1];
    if (!actual || !siguiente) return;

    this.cartaSiguiente.set(siguiente);
    this.mostrarSiguiente.set(true);

    const acertoMayor  = opcion === 'mayor'  && siguiente.valor >  actual.valor;
    const acertoMenor  = opcion === 'menor'  && siguiente.valor <  actual.valor;
    const acertoIgual  = opcion === 'igual'  && siguiente.valor === actual.valor;
    const acerto = acertoMayor || acertoMenor || acertoIgual;

    if (acerto) {
      this.aciertos.update(n => n + 1);
    } else {
      this.errores.update(n => n + 1);
    }

    if (this.errores() >= this.maxFallos || this.cartasRestantes() === 0) {
      this.estado.set('terminado');
      if (!this.guardada) {
        this.guardada = true;
        await this.guardar();
      }
      return;
    }

    setTimeout(() => {
      this.indice += 1;
      this.cartaActual.set(this.mazo[this.indice]);
      this.cartaSiguiente.set(null);
      this.mostrarSiguiente.set(false);
    }, 900);
  }

  etiquetaCorta(c: Carta): string {
    if (c.valor === 1) return 'AS';
    return String(c.valor);
  }

  etiquetaLarga(c: Carta): string {
    if (c.valor === 10) return 'SOTA';
    if (c.valor === 11) return 'CABALLO';
    if (c.valor === 12) return 'REY';
    return '';
  }

  emojiFigura(c: Carta): string {
    if (c.valor === 10) return '\u{1F935}'; // hombre con esmoquin (sota/paje)
    if (c.valor === 11) return '\u{1F40E}'; // caballo
    if (c.valor === 12) return '\u{1F934}'; // principe/rey
    return '';
  }

  coloresPalo(palo: Palo): string {
    switch (palo) {
      case 'oros':    return 'mm-palo-oros';
      case 'copas':   return 'mm-palo-copas';
      case 'espadas': return 'mm-palo-espadas';
      case 'bastos':  return 'mm-palo-bastos';
    }
  }

  private async guardar(): Promise<void> {
    const aciertos = this.aciertos();
    const errores = this.errores();
    const gano = errores < this.maxFallos;
    try {
      await this.partidas.guardar({
        juego: 'mayor-menor',
        gano,
        puntaje: aciertos,
        datos: {
          aciertos,
          errores,
          cartas_jugadas: this.indice + 1
        }
      });
    } catch (e: any) {
      this.modal.error(e?.message ?? 'No se pudo guardar el resultado.', 'Atencion');
    }
  }
}
