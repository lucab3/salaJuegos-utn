import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  effect,
  inject,
  signal
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ChatService } from '../../services/chat-service';
import { AuthService } from '../../services/auth-service';
import { ModalService } from '../../services/modal-service';

@Component({
  selector: 'app-chat',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './chat.html',
  styleUrl: './chat.scss'
})
export class Chat implements OnInit, OnDestroy, AfterViewChecked {
  private readonly fb = inject(FormBuilder);
  private readonly modal = inject(ModalService);
  protected readonly auth = inject(AuthService);
  protected readonly chat = inject(ChatService);

  readonly form = this.fb.nonNullable.group({
    contenido: ['', [Validators.required, Validators.maxLength(500)]]
  });

  readonly enviando = signal(false);
  private autoScroll = true;

  @ViewChild('listaMsg') listaMsg?: ElementRef<HTMLDivElement>;

  constructor() {
    effect(() => {
      // Re-corre al cambiar la lista de mensajes y dispara el auto-scroll abajo.
      this.chat.mensajes();
      this.autoScroll = true;
    });
  }

  async ngOnInit(): Promise<void> {
    try {
      await this.chat.iniciar();
    } catch (e: any) {
      this.modal.error(e?.message ?? 'No se pudo conectar al chat.', 'Chat');
    }
  }

  ngOnDestroy(): void {
    this.chat.detener();
  }

  ngAfterViewChecked(): void {
    if (this.autoScroll && this.listaMsg?.nativeElement) {
      this.listaMsg.nativeElement.scrollTop = this.listaMsg.nativeElement.scrollHeight;
      this.autoScroll = false;
    }
  }

  async enviar(): Promise<void> {
    if (this.form.invalid || this.enviando()) return;
    const texto = this.form.controls.contenido.value.trim();
    if (!texto) return;

    this.enviando.set(true);
    try {
      await this.chat.enviar(texto);
      this.form.reset({ contenido: '' });
    } catch (e: any) {
      this.modal.error(e?.message ?? 'No se pudo enviar el mensaje.', 'Chat');
    } finally {
      this.enviando.set(false);
    }
  }

  nombreAutor(uid: string, nombre: string | undefined, apellido: string | undefined, email: string | undefined): string {
    if (nombre || apellido) return `${nombre ?? ''} ${apellido ?? ''}`.trim();
    if (email) return email;
    return uid.slice(0, 6);
  }

  formatHora(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
  }
}
