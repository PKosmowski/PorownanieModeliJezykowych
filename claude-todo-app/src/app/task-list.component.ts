import { Component, inject, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { TaskService, TaskFilter } from './task.service';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Task } from './task.model';
import { CommonModule, DatePipe } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ConfirmModalComponent, ModalConfig } from './confirm-modal.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DatePipe, DragDropModule, ConfirmModalComponent],
  template: `
    <div class="task-container">
      <h2>Task List</h2>
      
      <!-- Task Filters -->
      <div class="task-filters">
        <button 
          *ngFor="let filter of filters"
          class="filter-button" 
          [class.active]="filter === taskService.currentFilter$()"
          (click)="taskService.setFilter(filter)">
          {{ filter | titlecase }}
        </button>
      </div>
      
      <!-- Add Task Form -->
      <form [formGroup]="taskForm" (ngSubmit)="addTask()" class="add-task-form">
        <div class="form-group">
          <textarea
            formControlName="description"
            placeholder="Enter task description..."
            required
            rows="3"
            class="task-input"
            (keydown.enter)="$event.preventDefault(); addTask()">
          </textarea>
          @if (taskForm.get('description')?.touched && taskForm.get('description')?.invalid) {
            <small class="error-message">Description is required</small>
          }
        </div>
        <div class="form-group">
          <input
            type="date"
            formControlName="dueDate"
            class="date-input"
            [min]="today">
        </div>
        <button type="submit" class="add-button" [disabled]="taskForm.invalid">
          Add Task
        </button>
      </form>

      <!-- Task List -->
      <div class="tasks-list">
        @for (task of taskService.allTasks(); track task.id) {
          <div class="task-item" [class.completed]="task.completed" [class.editing]="editingTaskId === task.id">
            <div class="task-content">
              <input 
                type="checkbox"
                [checked]="task.completed"
                (change)="taskService.toggleTask(task.id)"
                class="task-checkbox">
              <div class="task-details">
                @if (editingTaskId === task.id) {
                  <form [formGroup]="editForm" (ngSubmit)="saveEdit(task)" class="edit-form">
                    <textarea 
                      formControlName="description"
                      class="edit-input"
                      (keydown.enter)="$event.preventDefault(); saveEdit(task)"
                      (keydown.escape)="$event.preventDefault(); cancelEdit()"
                      #editInput
                      rows="2">
                    </textarea>
                    <input
                      type="date"
                      formControlName="dueDate"
                      class="edit-date-input"
                      [min]="today">
                    <div class="edit-actions">
                      <button type="button" class="save-button" 
                        [disabled]="!editForm.valid || !editForm.dirty"
                        (click)="saveEdit(task)">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                        </svg>
                      </button>
                      <button type="button" class="cancel-button" (click)="cancelEdit()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                        </svg>
                      </button>
                    </div>
                  </form>
                } @else {
                  <div class="task-header">
                    <p class="task-description">{{ task.description }}</p>
                    @if (taskService.isTaskOverdue(task)) {
                      <span class="overdue-label">Overdue</span>
                    }
                  </div>
                  <div class="task-meta">
                    <small class="task-date">Created: {{ task.createdAt | date:'medium' }}</small>
                    @if (task.dueDate) {
                      <small class="due-date" [class.overdue]="taskService.isTaskOverdue(task)">
                        Due: {{ task.dueDate | date:'mediumDate' }}
                      </small>
                    }
                  </div>
                }
              </div>
            </div>
            <div class="task-actions">
              @if (editingTaskId !== task.id) {
                <button 
                  class="edit-button"
                  (click)="startEdit(task)"
                  title="Edit task">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                  </svg>
                </button>
                <button 
                  class="delete-button"
                  (click)="deleteTask(task)"
                  title="Delete task">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                    <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                  </svg>
                </button>
              }
            </div>
          </div>
        }
        @empty {
          <p class="no-tasks">No tasks yet. Add your first task above!</p>
        }
      </div>

      <!-- Task Summary -->
      @if (taskService.allTasks().length > 0) {
        <div class="task-summary">
          <span>{{ taskService.pendingTasks().length }} pending</span>
          <span>{{ taskService.completedTasks().length }} completed</span>
          @if (taskService.completedTasks().length > 0) {
            <button 
              class="clear-button"
              (click)="showClearCompletedModal()">
              Clear completed
            </button>
          }
        </div>
      }
    </div>

    <app-confirm-modal
      *ngIf="showClearModal"
      [config]="clearModalConfig"
    ></app-confirm-modal>
  `,
  styles: [`
    .task-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 1rem;
    }

    h2 {
      color: #333;
      margin-bottom: 1.5rem;
    }

    .task-filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      background: white;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .filter-button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      background: #f8f9fa;
      color: #6c757d;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.875rem;
      text-transform: capitalize;
    }

    .filter-button:hover {
      background: #e9ecef;
      color: #495057;
    }

    .filter-button.active {
      background: #0d6efd;
      color: white;
    }

    .add-task-form {
      margin-bottom: 2rem;
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .task-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      resize: vertical;
    }

    .date-input, .edit-date-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      color: #333;
      background-color: white;
    }

    .add-button {
      background-color: #4CAF50;
      color: white;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      transition: background-color 0.2s;
    }

    .add-button:hover {
      background-color: #45a049;
    }

    .add-button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }

    .tasks-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .task-item {
      background: white;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      transition: all 0.3s ease;
    }

    .task-item:hover {
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .task-item.completed {
      background-color: #f8f9fa;
    }

    .task-content {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      flex: 1;
    }

    .task-checkbox {
      margin-top: 0.25rem;
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .task-details {
      flex: 1;
    }

    .task-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }

    .task-description {
      margin: 0;
      color: #333;
      font-size: 1rem;
      line-height: 1.4;
      flex: 1;
    }

    .task-meta {
      display: flex;
      gap: 1rem;
      color: #6c757d;
      font-size: 0.875rem;
    }

    .completed .task-description {
      text-decoration: line-through;
      color: #6c757d;
    }

    .overdue-label {
      background-color: #dc3545;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .due-date {
      color: #6c757d;
    }

    .due-date.overdue {
      color: #dc3545;
      font-weight: 500;
    }

    .task-actions {
      display: flex;
      gap: 0.5rem;
    }

    .delete-button, .edit-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.7;
      transition: all 0.2s ease;
    }

    .delete-button {
      color: #dc3545;
    }

    .edit-button {
      color: #0d6efd;
    }

    .delete-button:hover {
      opacity: 1;
      background-color: rgba(220, 53, 69, 0.1);
    }

    .edit-button:hover {
      opacity: 1;
      background-color: rgba(13, 110, 253, 0.1);
    }

    .task-summary {
      margin-top: 2rem;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .clear-button {
      background-color: #dc3545;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: background-color 0.2s;
    }

    .clear-button:hover {
      background-color: #c82333;
    }

    .error-message {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
      display: block;
    }

    .no-tasks {
      text-align: center;
      color: #6c757d;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .edit-form {
      width: 100%;
    }

    .edit-input {
      width: 100%;
      padding: 0.5rem;
      border: 2px solid #0d6efd;
      border-radius: 4px;
      font-size: 1rem;
      margin-bottom: 0.5rem;
      resize: vertical;
      background-color: white;
    }

    .edit-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
      margin-top: 0.5rem;
    }

    .save-button, .cancel-button {
      border: none;
      padding: 0.5rem;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .save-button {
      background-color: #4CAF50;
      color: white;
    }

    .save-button:hover {
      background-color: #45a049;
    }

    .save-button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }

    .cancel-button {
      background-color: #6c757d;
      color: white;
    }

    .cancel-button:hover {
      background-color: #5a6268;
    }
  `]
})
export class TaskListComponent implements OnInit, AfterViewInit {
  readonly taskService = inject(TaskService);
  readonly filters: TaskFilter[] = ['all', 'active', 'completed'];
  
  @ViewChild('editInput') editInput?: ElementRef<HTMLTextAreaElement>;
  
  taskForm!: FormGroup;
  editForm!: FormGroup;
  editingTaskId: number | null = null;

  showClearModal = false;

  clearModalConfig: ModalConfig = {
    message: 'Are you sure you want to clear all completed tasks?',
    onConfirm: () => {
      this.taskService.clearCompleted();
      this.showClearModal = false;
    },
    onCancel: () => {
      this.showClearModal = false;
    }
  };

  get today(): string {
    return new Date().toISOString().split('T')[0];
  }

  ngOnInit() {
    this.initForm();
    this.initEditForm();
  }

  ngAfterViewInit() {
    this.focusEditInput();
  }

  private initForm() {
    this.taskForm = new FormGroup({
      description: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(500)
      ]),
      dueDate: new FormControl(null)
    });
  }

  private initEditForm() {
    this.editForm = new FormGroup({
      description: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(500)
      ]),
      dueDate: new FormControl(null)
    });
  }

  private focusEditInput() {
    if (this.editInput?.nativeElement) {
      const textarea = this.editInput.nativeElement;
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    }
  }

  addTask() {
    if (this.taskForm.valid) {
      const description = this.taskForm.get('description')?.value?.trim();
      const dueDate = this.taskForm.get('dueDate')?.value;
      
      if (description) {
        this.taskService.addTask(description, dueDate ? new Date(dueDate) : null);
        this.taskForm.reset();
        this.taskForm.get('description')?.markAsUntouched();
      }
    } else {
      this.taskForm.markAllAsTouched();
    }
  }

  deleteTask(task: Task) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.removeTask(task.id);
      if (this.editingTaskId === task.id) {
        this.cancelEdit();
      }
    }
  }

  startEdit(task: Task) {
    this.editingTaskId = task.id;
    this.editForm.patchValue({
      description: task.description,
      dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : null
    });
    setTimeout(() => this.focusEditInput(), 0);
  }

  saveEdit(task: Task) {
    if (this.editForm.valid && this.editForm.dirty) {
      const newDescription = this.editForm.get('description')?.value?.trim();
      const newDueDate = this.editForm.get('dueDate')?.value;
      
      if (newDescription) {
        this.taskService.updateTaskDescription(task.id, newDescription);
        this.taskService.updateTaskDueDate(task.id, newDueDate ? new Date(newDueDate) : null);
        this.cancelEdit();
      }
    }
  }

  cancelEdit() {
    this.editingTaskId = null;
    this.editForm.reset();
  }

  showClearCompletedModal() {
    this.showClearModal = true;
  }
} 