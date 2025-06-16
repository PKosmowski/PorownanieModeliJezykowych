import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  template: `
    <div class="modal-overlay" (click)="onCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <h3>Confirm Action</h3>
        <p>Are you sure you want to clear all completed tasks?</p>
        <div class="modal-actions">
          <button class="cancel-btn" (click)="onCancel()">Cancel</button>
          <button class="confirm-btn" (click)="onConfirm()">Clear</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .modal-content {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1.5rem;
    }
    .cancel-btn {
      padding: 0.5rem 1rem;
      background: #f1f1f1;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .confirm-btn {
      padding: 0.5rem 1rem;
      background: #ff4757;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  `]
})
export class ConfirmationModalComponent {
  @Output() confirmed = new EventEmitter<void>();
  @Output() canceled = new EventEmitter<void>();

  onConfirm() {
    this.confirmed.emit();
  }

  onCancel() {
    this.canceled.emit();
  }
}