import { Component } from '@angular/core';
import { TodoService } from './services/todo.service';
import { TodoFormComponent } from './todo-form/todo-form.component';
import { TodoListComponent } from './todo-list/todo-list.component';
import { ConfirmationModalComponent } from './confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TodoFormComponent, TodoListComponent, ConfirmationModalComponent
  ],
  template: `
    <div class="container">
      <h1>Angular To-Do App</h1>
      <app-todo-form (addTodo)="todoService.addTodo($event.text, $event.dueDate)" />
      <button class="clear-btn" (click)="showModal = true">
        Clear Completed
      </button>
      @if (showModal) {
        <app-confirmation-modal
            (confirmed)="clearCompleted()"
            (canceled)="showModal = false"
        ></app-confirmation-modal>
      }

      <app-todo-list
        [todos]="todoService.filteredTodos()"
        (toggleTodo)="todoService.toggleTodo($event)"
        (deleteTodo)="todoService.deleteTodo($event)"
        (editTodo)="todoService.editTodo($event.id, $event.text)"
        (reorder)="todoService.reorderTodos($event.from, $event.to)"
      ></app-todo-list>
    </div>
  `,
  styleUrls: ['./app.component.scss'], // Correct path

})
export class AppComponent {


    showModal = false;

  constructor(public todoService: TodoService) {}

  clearCompleted() {
    this.todoService.clearCompleted();
    this.showModal = false;
  }
}