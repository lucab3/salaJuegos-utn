import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Session, User } from '@supabase/supabase-js';
import { SupabaseClientService } from './supabase-client';

export interface UsuarioPerfil {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  edad: number;
  created_at?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  edad: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseClientService).client;
  private readonly router = inject(Router);

  private readonly _session = signal<Session | null>(null);
  private readonly _perfil = signal<UsuarioPerfil | null>(null);
  private readonly _ready = signal(false);

  readonly session = this._session.asReadonly();
  readonly perfil = this._perfil.asReadonly();
  readonly ready = this._ready.asReadonly();
  readonly user = computed<User | null>(() => this._session()?.user ?? null);
  readonly isAuthenticated = computed(() => this._session() !== null);
  readonly displayName = computed(() => {
    const p = this._perfil();
    if (p) return `${p.nombre} ${p.apellido}`.trim();
    return this.user()?.email ?? '';
  });

  constructor() {
    this.supabase.auth.getSession().then(({ data }) => {
      this._session.set(data.session);
      this._ready.set(true);
      if (data.session) this.refrescarPerfil();
    });

    this.supabase.auth.onAuthStateChange((_event, session) => {
      this._session.set(session);
      if (session) this.refrescarPerfil();
      else this._perfil.set(null);
    });
  }

  async signIn(email: string, password: string): Promise<void> {
    const { error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(this.traducirError(error.message));
  }

  async signUp(data: SignUpData): Promise<void> {
    const { data: authData, error } = await this.supabase.auth.signUp({
      email: data.email,
      password: data.password
    });
    if (error) throw new Error(this.traducirError(error.message));
    if (!authData.user) throw new Error('No se pudo crear la cuenta. Probá de nuevo.');

    const { error: insertError } = await this.supabase.from('usuarios').insert({
      id: authData.user.id,
      email: data.email,
      nombre: data.nombre,
      apellido: data.apellido,
      edad: data.edad
    });
    if (insertError) throw new Error('Cuenta creada pero falló el guardado del perfil: ' + insertError.message);
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
    this._perfil.set(null);
    await this.router.navigateByUrl('/home');
  }

  private async refrescarPerfil(): Promise<void> {
    const user = this.user();
    if (!user) return;
    const { data, error } = await this.supabase
      .from('usuarios')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    if (!error && data) this._perfil.set(data as UsuarioPerfil);
  }

  private traducirError(msg: string): string {
    const m = msg.toLowerCase();
    if (m.includes('invalid login credentials')) return 'Email o contraseña incorrectos.';
    if (m.includes('email not confirmed')) return 'Tenés que confirmar el email antes de ingresar.';
    if (m.includes('user already registered')) return 'Ya existe una cuenta con ese email.';
    if (m.includes('password should be at least')) return 'La contraseña es demasiado corta (mínimo 6 caracteres).';
    if (m.includes('rate limit')) return 'Demasiados intentos. Esperá un momento y probá de nuevo.';
    if (m.includes('network')) return 'Sin conexión con el servidor. Revisá tu internet.';
    return msg;
  }
}
