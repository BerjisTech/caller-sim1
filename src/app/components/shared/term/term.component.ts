import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Term } from '../../../interfaces/translation/terms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-term',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './term.component.html',
  styleUrl: './term.component.scss',
})
export class TermComponent {
  @Input() term!: Term;
  // Properly define the output with an EventEmitter
  @Output() updateTermDetails: EventEmitter<Term> = new EventEmitter<Term>();

  // Emit the term using the EventEmitter
  emitTerm(term: Term) {
    this.updateTermDetails.emit(term);
  }

  highlightTerm(term: string) {
    // Highlight the term.term in the provided example
    return term.replace(this.term.term, `<span class="font-bold">${this.term.term}</span>`);
  }
}
