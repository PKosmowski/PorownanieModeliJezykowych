import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  dueDate?: string; // ISO string format (e.g., "2025-06-20")
}
export type FilterType = 'all' | 'active' | 'completed';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private platformId = inject(PLATFORM_ID);
  todos = signal<Todo[]>(this.loadInitialTodos());
  filter = signal<FilterType>('all');

  constructor() {
    // Only run effects in the browser
    if (isPlatformBrowser(this.platformId)) {
      effect(() => {
        localStorage.setItem('angular-todos', JSON.stringify(this.todos()));
      });
    }
  }

  private loadInitialTodos(): Todo[] {
    // Only attempt localStorage access in the browser
    if (isPlatformBrowser(this.platformId)) {
      try {
        const data = localStorage.getItem('angular-todos');
        return data ? JSON.parse(data) : [];
      } catch (e) {
        console.error('Failed to load todos', e);
      }
    }
    return [];
  }

  // Computed filtered todos
  filteredTodos = computed(() => {
    const filter = this.filter();
    const todos = this.todos();
    
    switch (filter) {
      case 'active':
        return todos.filter(todo => !todo.completed);
      case 'completed':
        return todos.filter(todo => todo.completed);
      default:
        return todos;
    }
  });

  reorderTodos(fromIndex: number, toIndex: number) {
  this.todos.update(todos => {
    const updatedTodos = [...todos];
    const [movedTodo] = updatedTodos.splice(fromIndex, 1);
    updatedTodos.splice(toIndex, 0, movedTodo);
    return updatedTodos;
});
}
addTodo(text: string, dueDate?: string) {
  const newTodo: Todo = {
    id: Date.now(),
    text,
    completed: false,
    dueDate: dueDate || undefined,
  };
  this.todos.update((todos) => [...todos, newTodo]);
}
clearCompleted() {
  this.todos.update(todos => todos.filter(todo => !todo.completed));
}

  toggleTodo(id: number) {
    this.todos.update((todos) =>
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }

  deleteTodo(id: number) {
    this.todos.update((todos) => todos.filter((todo) => todo.id !== id));
  }
  editTodo(id: number, newText: string) {
  this.todos.update((todos) =>
    todos.map((todo) =>
      todo.id === id ? { ...todo, text: newText } : todo
    )
  );
}
}