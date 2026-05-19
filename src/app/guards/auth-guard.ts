import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { ModalService } from '../services/modal-service';

const esperarAuthReady = (auth: AuthService): Promise<void> =>
  new Promise(resolve => {
    if (auth.ready()) return resolve();
    const id = setInterval(() => {
      if (auth.ready()) {
        clearInterval(id);
        resolve();
      }
    }, 25);
  });

export const authGuard: CanActivateFn = async (): Promise<boolean | UrlTree> => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const modal = inject(ModalService);

  await esperarAuthReady(auth);
  if (auth.isAuthenticated()) return true;

  modal.warning('Tenés que iniciar sesión para acceder a esta sección.', 'Acceso restringido');
  return router.createUrlTree(['/login']);
};

export const guestGuard: CanActivateFn = async (): Promise<boolean | UrlTree> => {
  const auth = inject(AuthService);
  const router = inject(Router);

  await esperarAuthReady(auth);
  if (!auth.isAuthenticated()) return true;

  return router.createUrlTree(['/home']);
};
