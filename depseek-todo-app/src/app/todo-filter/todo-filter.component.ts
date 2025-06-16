import { Component, output, input } from '@angular/core';
import { TodoService, FilterType } from '../services/todo.service';

@Component({
  selector: 'app-todo-filter',
  standalone: true,
  template: `
    <div class="filter-buttons">
      <button 
        [class.active]="currentFilter() === 'all'"
        (click)="changeFilter.emit('all')">
        All
      </button>
      <button 
        [class.active]="currentFilter() === 'active'"
        (click)="changeFilter.emit('active')">
        Active
      </button>
      <button 
        [class.active]="currentFilter() === 'completed'"
        (click)="changeFilter.emit('completed')">
        Completed
      </button>
    </div>
  `,
  styles: [`
    .filter-buttons {
      display: flex;
      gap: 8px;
      margin: 1rem 0;
    }
    button {
      padding: 6px 12px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }
    button.active {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }
  `]
})
export class TodoFilterComponent {
  currentFilter = input.required<FilterType>();
  changeFilter = output<FilterType>();
}