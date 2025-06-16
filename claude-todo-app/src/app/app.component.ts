import { Component } from '@angular/core';
import { TaskListComponent } from './task-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TaskListComponent],
  template: `
    <app-task-list></app-task-list>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: #f8f9fa;
    }
  `]
})
export class AppComponent {}
