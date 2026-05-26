import { Injectable, inject } from '@angular/core';
import { SupabaseClientService } from './supabase-client';
import { AuthService } from './auth-service';

export type JuegoId = 'ahorcado' | 'mayor-menor' | 'preguntados' | 'buscaminas';

export interface Partida {
  id?: number;
  user_id?: string;
  juego: JuegoId;
  gano?: boolean | null;
  puntaje: number;
  datos?: Record<string, unknown>;
  jugada_en?: string;
}

export interface RankingFila {
  id: number;
  juego: JuegoId;
  gano: boolean | null;
  puntaje: number;
  jugada_en: string;
  datos: Record<string, unknown>;
  usuario: {
    nombre: string;
    apellido: string;
    email: string;
  } | null;
}

@Injectable({ providedIn: 'root' })
export class PartidasService {
  private readonly supabase = inject(SupabaseClientService).client;
  private readonly auth = inject(AuthService);

  async guardar(partida: Partida): Promise<void> {
    const userId = this.auth.user()?.id;
    if (!userId) throw new Error('No hay sesion activa para guardar la partida.');

    const fila = {
      user_id: userId,
      juego: partida.juego,
      gano: partida.gano ?? null,
      puntaje: Math.max(0, Math.floor(partida.puntaje)),
      datos: partida.datos ?? {}
    };

    const { error } = await this.supabase.from('partidas').insert(fila);
    if (error) throw new Error('No se pudo guardar la partida: ' + error.message);
  }

  async ranking(juego: JuegoId, limite = 10): Promise<RankingFila[]> {
    const { data, error } = await this.supabase
      .from('partidas')
      .select('id, user_id, juego, gano, puntaje, jugada_en, datos')
      .eq('juego', juego)
      .order('puntaje', { ascending: false })
      .order('jugada_en', { ascending: false })
      .limit(limite);

    if (error) throw new Error('No se pudo cargar el ranking: ' + error.message);

    const filas = data ?? [];
    const userIds = Array.from(new Set(filas.map(f => f.user_id as string)));

    const perfiles = new Map<string, { nombre: string; apellido: string; email: string }>();
    if (userIds.length > 0) {
      const { data: usuarios } = await this.supabase
        .from('usuarios')
        .select('id, nombre, apellido, email')
        .in('id', userIds);
      for (const u of usuarios ?? []) {
        perfiles.set(u.id as string, {
          nombre: u.nombre as string,
          apellido: u.apellido as string,
          email: u.email as string
        });
      }
    }

    return filas.map(r => ({
      id: r.id as number,
      juego: r.juego as JuegoId,
      gano: r.gano as boolean | null,
      puntaje: r.puntaje as number,
      jugada_en: r.jugada_en as string,
      datos: (r.datos ?? {}) as Record<string, unknown>,
      usuario: perfiles.get(r.user_id as string) ?? null
    }));
  }
}
