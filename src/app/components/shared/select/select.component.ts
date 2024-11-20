import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
})
export class SelectComponent {
  public show_options: boolean = false;
  public search_term: string = '';

  updateOptions(event: Event) {
    this.search_term = (event.target as HTMLInputElement).value;
    this.show_options = this.search_term.length > 0;
  }
}
