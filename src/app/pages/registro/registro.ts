import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ModalService } from '../../services/modal-service';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.scss'
})
export class Registro {
  private readonly fb = inject(FormBuilder);
  private readonly modal = inject(ModalService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly cargando = signal(false);

  readonly form = this.fb.nonNullable.group({
    nombre:    ['', [Validators.required, Validators.minLength(2)]],
    apellido:  ['', [Validators.required, Validators.minLength(2)]],
    edad:      [18, [Validators.required, Validators.min(13), Validators.max(120)]],
    email:     ['', [Validators.required, Validators.email]],
    password:  ['', [Validators.required, Validators.minLength(6)]]
  });

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.modal.warning('Completá todos los campos correctamente para registrarte.', 'Datos incompletos');
      return;
    }

    this.cargando.set(true);
    const datos = this.form.getRawValue();
    try {
      await this.auth.signUp(datos);
      this.modal.success(`Bienvenido, ${datos.nombre}. Tu cuenta fue creada y ya iniciaste sesión.`, 'Registro exitoso');
      await this.router.navigateByUrl('/home');
    } catch (e) {
      this.modal.error((e as Error).message, 'No se pudo crear la cuenta');
    } finally {
      this.cargando.set(false);
    }
  }
}
