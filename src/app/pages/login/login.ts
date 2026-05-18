import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../services/modal-service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly modal = inject(ModalService);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.modal.warning('Revisá los campos del formulario.', 'Datos incompletos');
      return;
    }
    this.modal.info(
      'La autenticación contra Supabase se implementa en el Sprint #2. Por ahora, este formulario sólo valida los campos.',
      'Sprint #2 en camino'
    );
  }
}
