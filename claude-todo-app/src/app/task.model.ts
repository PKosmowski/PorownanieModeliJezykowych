export interface Task {
  id: number;
  description: string;
  createdAt: Date;
  dueDate: Date | null;
  completed: boolean;
  order: number;
} 