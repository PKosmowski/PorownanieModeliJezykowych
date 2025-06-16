import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ModalConfig {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="config.onCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <p class="modal-message">{{ config.message }}</p>
        <div class="modal-actions">
          <button class="modal-button cancel" (click)="config.onCancel()">Cancel</button>
          <button class="modal-button confirm" (click)="config.onConfirm()">Confirm</button>
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
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-width: 400px;
      width: 90%;
    }

    .modal-message {
      margin: 0 0 20px 0;
      font-size: 16px;
      text-align: center;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .modal-button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.3s;
    }

    .modal-button.cancel {
      background-color: #e0e0e0;
      color: #333;
    }

    .modal-button.cancel:hover {
      background-color: #d0d0d0;
    }

    .modal-button.confirm {
      background-color: #ff4444;
      color: white;
    }

    .modal-button.confirm:hover {
      background-color: #ff2020;
    }
  `]
})
export class ConfirmModalComponent {
  @Input() config!: ModalConfig;
} 