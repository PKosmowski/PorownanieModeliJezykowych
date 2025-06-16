import { Component, output } from "@angular/core";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-todo-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <form (ngSubmit)="onSubmit()">
      <input
        type="text"
        [(ngModel)]="text"
        name="taskText"
        placeholder="Task description"
        required
      />
      <input
        type="date"
        [(ngModel)]="dueDate"
        name="taskDueDate"
        [min]="todayISO"
      />
      <button type="submit">Add</button>
    </form>
  `,

})
export class TodoFormComponent {
  text = '';
  dueDate = '';
  todayISO = new Date().toISOString().split('T')[0];

  addTodo = output<{text: string, dueDate?: string}>();

  onSubmit() {
    if (this.text.trim()) {
      this.addTodo.emit({
        text: this.text,
        dueDate: this.dueDate || undefined
      });
      this.text = '';
      this.dueDate = '';
    }
  }
}