import { Injectable, signal } from '@angular/core';

export type ModalKind = 'info' | 'success' | 'warning' | 'danger';

export interface ModalState {
  open: boolean;
  kind: ModalKind;
  title: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  readonly state = signal<ModalState>({
    open: false,
    kind: 'info',
    title: '',
    message: ''
  });

  show(title: string, message: string, kind: ModalKind = 'info'): void {
    this.state.set({ open: true, title, message, kind });
  }

  info(message: string, title = 'Información') {
    this.show(title, message, 'info');
  }
  success(message: string, title = '¡Listo!') {
    this.show(title, message, 'success');
  }
  warning(message: string, title = 'Atención') {
    this.show(title, message, 'warning');
  }
  error(message: string, title = 'Error') {
    this.show(title, message, 'danger');
  }

  close(): void {
    this.state.update(s => ({ ...s, open: false }));
  }
}
