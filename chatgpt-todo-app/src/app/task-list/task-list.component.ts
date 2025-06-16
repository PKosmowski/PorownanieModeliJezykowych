import { Component, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

interface Task {
  id: number;
  description: string;
  done: boolean;
  dueDate: string; // ISO string
}
const LOCAL_STORAGE_KEY = 'angular-todo-tasks';
function loadTasks(): Task[] {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}
type Filter = 'all' | 'active' | 'completed';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DragDropModule],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent {
  private nextId = 1;

  tasks = signal<Task[]>(loadTasks());

  editingTaskId = signal<number | null>(null);
  editForm: FormGroup;
  taskForm: FormGroup;

  currentFilter = signal<Filter>('all');

  filteredTasks = computed(() => {
  const filter = this.currentFilter();
  const allTasks = this.tasks();

  switch (filter) {
    case 'active':
      return allTasks.filter(task => !task.done);
    case 'completed':
      return allTasks.filter(task => task.done);
    default:
      return allTasks;
  }
});
showConfirmModal = signal(false);

openConfirmModal(): void {
  this.showConfirmModal.set(true);
}

closeConfirmModal(): void {
  this.showConfirmModal.set(false);
}

confirmClearCompleted(): void {
  this.clearCompleted();
  this.closeConfirmModal();
}

setFilter(filter: Filter): void {
  this.currentFilter.set(filter);
}
constructor(private fb: FormBuilder) {
this.taskForm = this.fb.group({
  description: ['', [Validators.required, Validators.minLength(3)]],
  dueDate: ['', Validators.required],
});

  this.editForm = this.fb.group({
    description: ['', [Validators.required, Validators.minLength(3)]],
  });

  // Sync tasks to localStorage on update
  effect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.tasks()));
  });
}
  
drop(event: CdkDragDrop<Task[]>) {
  const current = this.tasks();
  moveItemInArray(current, event.previousIndex, event.currentIndex);
  this.tasks.set([...current]); // trigger reactivity
}
  addTask(): void {
    if (this.taskForm.invalid) return;

    const newTask: Task = {
    id: this.nextId++,
    description: this.taskForm.value.description,
    done: false,
    dueDate: this.taskForm.value.dueDate
    };

    this.tasks.update(tasks => [...tasks, newTask]);
    this.taskForm.reset();
  }

  deleteTask(taskId: number): void {
    this.tasks.update(tasks => tasks.filter(task => task.id !== taskId));
  }

  startEditing(task: Task): void {
  this.editingTaskId.set(task.id);
  this.editForm.setValue({ description: task.description });
}

get hasCompletedTasks(): boolean {
  return this.tasks() && this.tasks().some(task => task.done);
}

cancelEditing(): void {
  this.editingTaskId.set(null);
}

  saveTaskEdit(taskId: number): void {
  if (this.editForm.invalid) return;

  const updatedDescription = this.editForm.value.description;

  this.tasks.update(tasks =>
    tasks.map(task =>
      task.id === taskId ? { ...task, description: updatedDescription } : task
    )
  );

  this.editingTaskId.set(null);
}

toggleDone(taskId: number): void {
  this.tasks.update(tasks =>
    tasks.map(task =>
      task.id === taskId ? { ...task, done: !task.done } : task
    )
  );
}
isOverdue(dueDate: string): boolean {
  return new Date(dueDate).getTime() < new Date().setHours(0, 0, 0, 0);
}

clearCompleted(): void {
  this.tasks.update(tasks => tasks.filter(task => !task.done));
}

}
