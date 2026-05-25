import { Injectable, inject, signal } from '@angular/core';
import { RealtimeChannel } from '@supabase/supabase-js';
import { SupabaseClientService } from './supabase-client';
import { AuthService } from './auth-service';

export interface MensajeChat {
  id: number;
  user_id: string;
  contenido: string;
  enviado_en: string;
  usuario: {
    nombre: string;
    apellido: string;
    email: string;
  } | null;
}

interface MensajeCrudo {
  id: number;
  user_id: string;
  contenido: string;
  enviado_en: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly supabase = inject(SupabaseClientService).client;
  private readonly auth = inject(AuthService);

  private readonly _mensajes = signal<MensajeChat[]>([]);
  readonly mensajes = this._mensajes.asReadonly();

  private canal: RealtimeChannel | null = null;
  private perfilesCache = new Map<string, { nombre: string; apellido: string; email: string }>();

  async iniciar(): Promise<void> {
    if (this.canal) return;

    const { data, error } = await this.supabase
      .from('mensajes_chat')
      .select('id, user_id, contenido, enviado_en')
      .order('enviado_en', { ascending: true })
      .limit(200);

    if (error) throw new Error('No se pudo cargar el chat: ' + error.message);

    const userIds = Array.from(new Set((data ?? []).map(m => m.user_id)));
    await this.precargarPerfiles(userIds);

    this._mensajes.set((data ?? []).map(m => this.armarMensaje(m as MensajeCrudo)));

    this.canal = this.supabase
      .channel('mensajes_chat_global')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mensajes_chat' },
        async (payload) => {
          const nuevo = payload.new as MensajeCrudo;
          await this.precargarPerfiles([nuevo.user_id]);
          this._mensajes.update(arr => [...arr, this.armarMensaje(nuevo)]);
        }
      )
      .subscribe();
  }

  async enviar(contenido: string): Promise<void> {
    const texto = contenido.trim();
    if (!texto) return;
    if (texto.length > 500) throw new Error('El mensaje no puede superar 500 caracteres.');

    const userId = this.auth.user()?.id;
    if (!userId) throw new Error('Tenes que iniciar sesion para enviar mensajes.');

    const { error } = await this.supabase
      .from('mensajes_chat')
      .insert({ user_id: userId, contenido: texto });

    if (error) throw new Error('No se pudo enviar el mensaje: ' + error.message);
  }

  detener(): void {
    if (this.canal) {
      this.supabase.removeChannel(this.canal);
      this.canal = null;
    }
  }

  esMio(m: MensajeChat): boolean {
    return m.user_id === this.auth.user()?.id;
  }

  private async precargarPerfiles(userIds: string[]): Promise<void> {
    const faltantes = userIds.filter(id => id && !this.perfilesCache.has(id));
    if (faltantes.length === 0) return;

    const { data, error } = await this.supabase
      .from('usuarios')
      .select('id, nombre, apellido, email')
      .in('id', faltantes);

    if (error) return;
    for (const u of data ?? []) {
      this.perfilesCache.set(u.id as string, {
        nombre: u.nombre as string,
        apellido: u.apellido as string,
        email: u.email as string
      });
    }
  }

  private armarMensaje(m: MensajeCrudo): MensajeChat {
    const perfil = this.perfilesCache.get(m.user_id) ?? null;
    return {
      id: m.id,
      user_id: m.user_id,
      contenido: m.contenido,
      enviado_en: m.enviado_en,
      usuario: perfil
    };
  }
}
