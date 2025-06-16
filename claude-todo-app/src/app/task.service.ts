import { Injectable, signal, computed, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Task } from './task.model';

export type TaskFilter = 'all' | 'active' | 'completed';

const STORAGE_KEYS = {
  TASKS: 'tasks',
  FILTER: 'taskFilter'
} as const;

// Helper function to add days to a date
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const DEFAULT_TASKS: Task[] = [
  {
    id: 1,
    description: 'Complete Angular tutorial',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    dueDate: addDays(new Date(), -1), // Yesterday
    completed: true
  },
  {
    id: 2,
    description: 'Review pull requests',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    dueDate: addDays(new Date(), 1), // Tomorrow
    completed: false
  },
  {
    id: 3,
    description: 'Plan team meeting agenda',
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    dueDate: new Date(), // Today
    completed: false
  }
].map((task, index) => ({ ...task, order: index }));

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private tasks = signal<Task[]>(this.loadTasks());
  private currentFilter = signal<TaskFilter>(this.loadFilter());

  constructor() {
    if (this.isBrowser) {
      // Set up effect to save tasks whenever they change
      effect(() => {
        const tasks = this.tasks();
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      });

      // Set up effect to save filter whenever it changes
      effect(() => {
        const filter = this.currentFilter();
        localStorage.setItem(STORAGE_KEYS.FILTER, filter);
      });
    }
  }

  private loadTasks(): Task[] {
    if (!this.isBrowser) {
      return DEFAULT_TASKS;
    }

    try {
      const savedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (!savedTasks) {
        return DEFAULT_TASKS;
      }

      const tasks = JSON.parse(savedTasks);
      
      // Convert string dates back to Date objects and ensure order property exists
      return tasks.map((task: any, index: number) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        order: task.order ?? index
      }));
    } catch (error) {
      console.error('Error loading tasks from localStorage:', error);
      return DEFAULT_TASKS;
    }
  }

  private loadFilter(): TaskFilter {
    if (!this.isBrowser) {
      return 'all';
    }

    try {
      const savedFilter = localStorage.getItem(STORAGE_KEYS.FILTER) as TaskFilter;
      return savedFilter || 'all';
    } catch (error) {
      console.error('Error loading filter from localStorage:', error);
      return 'all';
    }
  }

  // Expose read-only signals for components
  readonly allTasks = computed(() => {
    const filter = this.currentFilter();
    const tasks = this.tasks();
    
    // First filter tasks based on the current filter
    const filteredTasks = (() => {
      switch (filter) {
        case 'active':
          return tasks.filter(task => !task.completed);
        case 'completed':
          return tasks.filter(task => task.completed);
        default:
          return tasks;
      }
    })();

    // Then sort by order
    return [...filteredTasks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  });
  
  readonly completedTasks = computed(() => 
    this.tasks().filter(task => task.completed)
  );

  readonly pendingTasks = computed(() => 
    this.tasks().filter(task => !task.completed)
  );

  readonly currentFilter$ = this.currentFilter.asReadonly();

  setFilter(filter: TaskFilter) {
    this.currentFilter.set(filter);
  }

  addTask(description: string, dueDate: Date | null = null) {
    const newTask: Task = {
      id: Date.now(),
      description: description.trim(),
      createdAt: new Date(),
      dueDate,
      completed: false,
      order: this.tasks().length
    };
    
    this.tasks.update(tasks => [...tasks, newTask]);
  }

  toggleTask(id: number) {
    this.tasks.update(tasks => 
      tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }

  removeTask(id: number) {
    this.tasks.update(tasks => {
      const removedTask = tasks.find(t => t.id === id);
      if (!removedTask) return tasks;

      // Remove the task and reorder remaining tasks
      const remainingTasks = tasks.filter(t => t.id !== id);
      return remainingTasks.map((task, index) => ({
        ...task,
        order: task.order > removedTask.order ? task.order - 1 : task.order
      }));
    });
  }

  updateTaskDescription(id: number, newDescription: string) {
    this.tasks.update(tasks =>
      tasks.map(task =>
        task.id === id ? { ...task, description: newDescription.trim() } : task
      )
    );
  }

  updateTaskDueDate(id: number, newDueDate: Date | null) {
    this.tasks.update(tasks =>
      tasks.map(task =>
        task.id === id ? { ...task, dueDate: newDueDate } : task
      )
    );
  }

  reorderTasks(previousIndex: number, currentIndex: number) {
    this.tasks.update(tasks => {
      const orderedTasks = [...tasks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const [movedTask] = orderedTasks.splice(previousIndex, 1);
      orderedTasks.splice(currentIndex, 0, movedTask);
      
      // Update order for all tasks
      return orderedTasks.map((task, index) => ({
        ...task,
        order: index
      }));
    });
  }

  clearCompleted() {
    this.tasks.update(tasks => {
      const remainingTasks = tasks.filter(task => !task.completed);
      // Reorder remaining tasks
      return remainingTasks.map((task, index) => ({
        ...task,
        order: index
      }));
    });
  }

  isTaskOverdue(task: Task): boolean {
    if (!task.dueDate || task.completed) return false;
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Compare dates without time
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < now;
  }
} 