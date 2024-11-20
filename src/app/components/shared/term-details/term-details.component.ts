import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Term } from '../../../interfaces/translation/terms';
import { SelectComponent } from '../select/select.component';

@Component({
  selector: 'app-term-details',
  standalone: true,
  imports: [SelectComponent],
  templateUrl: './term-details.component.html',
  styleUrl: './term-details.component.scss',
})
export class TermDetailsComponent {
  @Input() term!: Term;
  @Output() close: EventEmitter<boolean> = new EventEmitter<boolean>(false);

  // Emit the term using the EventEmitter
  closeDetails() {
    this.close.emit(false);
  }
}
