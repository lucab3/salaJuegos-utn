import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../services/modal-service';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.scss'
})
export class Registro {
  private readonly fb = inject(FormBuilder);
  private readonly modal = inject(ModalService);

  readonly form = this.fb.nonNullable.group({
    nombre:    ['', [Validators.required, Validators.minLength(2)]],
    apellido:  ['', [Validators.required, Validators.minLength(2)]],
    edad:      [18, [Validators.required, Validators.min(13), Validators.max(120)]],
    email:     ['', [Validators.required, Validators.email]],
    password:  ['', [Validators.required, Validators.minLength(6)]]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.modal.warning('Completá todos los campos correctamente para registrarte.', 'Datos incompletos');
      return;
    }
    this.modal.info(
      'El registro contra Supabase (Auth + tabla usuarios) se implementa en el Sprint #2. Por ahora, el formulario valida los datos.',
      'Sprint #2 en camino'
    );
  }
}
