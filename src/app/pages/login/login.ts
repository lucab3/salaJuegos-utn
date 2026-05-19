import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ModalService } from '../../services/modal-service';
import { AuthService } from '../../services/auth-service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly modal = inject(ModalService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly testUsers = environment.testUsers;
  readonly cargando = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.modal.warning('Revisá los campos del formulario.', 'Datos incompletos');
      return;
    }
    await this.intentarLogin(this.form.getRawValue().email, this.form.getRawValue().password);
  }

  async loginRapido(email: string, password: string): Promise<void> {
    this.form.patchValue({ email, password });
    await this.intentarLogin(email, password);
  }

  private async intentarLogin(email: string, password: string): Promise<void> {
    this.cargando.set(true);
    try {
      await this.auth.signIn(email, password);
      this.modal.success(`Bienvenido, ${this.auth.displayName() || email}.`, 'Sesión iniciada');
      await this.router.navigateByUrl('/home');
    } catch (e) {
      this.modal.error((e as Error).message, 'No se pudo iniciar sesión');
    } finally {
      this.cargando.set(false);
    }
  }
}
