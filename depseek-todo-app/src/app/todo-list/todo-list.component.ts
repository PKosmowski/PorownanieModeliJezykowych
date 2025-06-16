import { Component, input, output, Output, EventEmitter } from '@angular/core';
import { Todo } from '../services/todo.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <ul class="drag-list">
      @for (todo of todos(); track todo.id; let i = $index) {
        <li 
          [class.overdue]="isOverdue(todo.dueDate)"
          draggable="true"
          (dragstart)="onDragStart($event, i)"
          (dragover)="onDragOver($event, i)"
          (dragend)="onDragEnd()"
          (drop)="onDrop($event, i)"
        >
          <!-- Existing task content -->
          <div class="drag-handle">☰</div>
          
          <input
            type="checkbox"
            [checked]="todo.completed"
            (change)="toggleTodo.emit(todo.id)"
          />
          
          <span [class.completed]="todo.completed">
            {{ todo.text }}
          </span>

          @if (todo.dueDate) {
            <span class="due-date">
              (Due: {{ todo.dueDate | date:'shortDate' }})
              @if (isOverdue(todo.dueDate)) {
                <span class="warning">OVERDUE</span>
              }
            </span>
          }

          <button (click)="startEditing(todo.id)">✏️</button>
          <button (click)="deleteTodo.emit(todo.id)">🗑️</button>
        </li>
      }
    </ul>
  `,
  styles: [
    `
    .completed {
      text-decoration: line-through;
      opacity: 0.6;
    }
    .due-date {
      font-size: 0.8rem;
      color: #666;
      margin-left: 8px;
    }
    .warning {
      color: #d63031;
      font-weight: bold;
      margin-left: 4px;
    }
    .overdue {
      border-left: 3px solid #d63031;
      padding-left: 8px;
    }
    `
  ]
})
export class TodoListComponent {
  todos = input.required<Todo[]>();
  toggleTodo = output<number>();
  deleteTodo = output<number>();
  editTodo = output<{ id: number; text: string }>(); // <-- New output
@Output() reorder = new EventEmitter<{from: number, to: number}>();
  // Track which tasks are being edited
  editing: Record<number, boolean> = {};
  editedText: Record<number, string> = {};

    private draggedIndex: number | null = null;

  onDragStart(event: DragEvent, index: number) {
    this.draggedIndex = index;
    event.dataTransfer?.setData('text/plain', index.toString());
    event.dataTransfer!.effectAllowed = 'move';
    (event.target as HTMLElement).classList.add('dragging');
  }

  onDragOver(event: DragEvent, index: number) {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
  }

  onDrop(event: DragEvent, targetIndex: number) {
    event.preventDefault();
    if (this.draggedIndex !== null && this.draggedIndex !== targetIndex) {
      this.reorder.emit({ from: this.draggedIndex, to: targetIndex });
    }
    (event.target as HTMLElement).classList.remove('dragging');
  }

  onDragEnd() {
    this.draggedIndex = null;
  }

  startEditing(id: number) {
    this.editing[id] = true;
    this.editedText[id] = this.todos().find(todo => todo.id === id)?.text || '';
  }

  isOverdue(dueDate?: string): boolean {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  }

  saveEdit(id: number) {
    if (this.editedText[id]?.trim()) {
      this.editTodo.emit({ id, text: this.editedText[id] });
    }
    this.editing[id] = false;
  }
}