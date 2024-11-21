import { Component, HostListener, OnInit } from '@angular/core';
import { NavComponent } from '../../components/shared/nav/nav.component';
import { CommonModule } from '@angular/common';
import { SelectComponent } from '../../components/shared/select/select.component';
import { TermComponent } from '../../components/shared/term/term.component';
import { Term } from '../../interfaces/translation/terms';
import { faker } from '@faker-js/faker';
import { TermDetailsComponent } from '../../components/shared/term-details/term-details.component';
import { CalendarComponent } from "../../components/shared/calendar/calendar.component";

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, NavComponent, TermComponent, TermDetailsComponent, CalendarComponent],
  templateUrl: './terms.component.html',
  styleUrl: './terms.component.scss',
})
export class TermsComponent implements OnInit {
  public current_term!: Term;
  public showDetails: boolean = true;
  public terms: Term[] = [];

  ngOnInit(): void {
    this.getTerms();
    //  if width is less than lg then set showDetails to false on init
    if (window.innerWidth < 1024) {
      this.showDetails = false;
    } else {
      this.showDetails = true;
    }
    this.updateTermDetails(this.terms[0]);
  }

  getTerms = () => {
    // Fetch terms from API
    // this.terms = this.apiService.getTerms();
    // For now, use a dummy array of terms

    this.terms = Array.from({ length: 10 }, () => {
      return {
        id: '0',
        term: faker.lorem.word(),
        definition: faker.lorem.sentence(),
        spelling: faker.lorem.word(),
        parts_of_speech: [''],
        synonyms: [],
        antonyms: [],
        examples: this.dummy_examples(),
        created_by: {
          id: '',
          username: '',
          languages: [],
          is_vetted: false,
        },
        language: {
          id: '',
          name: '',
          iso_code: '',
          iso_639_1: '',
          iso_639_2: '',
          family: '',
          countries_spoken: [],
          tribes: [],
          dialects: [
            {
              id: '',
              name: '',
              language_id: '',
            },
          ],
        },
        dialect_id: '',
        attachments: [],
        translations: [],
        creation_date: new Date(),
      };
    });
  };

  // listen to width changes and update showDetails
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (event.target.innerWidth < 1024) {
      this.showDetails = false;
    } else {
      this.showDetails = true;
    }
  }

  updateTermDetails(term: Term) {
    if (window.innerWidth < 1024) {
      this.showDetails = true;
    }
    this.current_term = term;
  }

  closeDetails() {
    this.showDetails = false;
  }

  random_integer = (limit: number) => Math.floor(Math.random() * limit);
  dummy_examples = () =>
    Array.from({ length: this.random_integer(5) }, () =>
      faker.lorem.sentence()
    );
}
