import { Component, computed, inject } from '@angular/core';
import { ModalService } from '../../services/modal-service';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.html',
  styleUrl: './modal.scss'
})
export class Modal {
  private readonly modalService = inject(ModalService);

  readonly state = this.modalService.state;

  readonly iconClass = computed(() => {
    switch (this.state().kind) {
      case 'success': return 'bi-check-circle-fill text-success';
      case 'warning': return 'bi-exclamation-triangle-fill text-warning';
      case 'danger':  return 'bi-x-octagon-fill text-danger';
      default:        return 'bi-info-circle-fill text-primary';
    }
  });

  close(): void {
    this.modalService.close();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }
}
