import { Component, HostListener, OnInit } from '@angular/core';
import { NavComponent } from '../../components/shared/nav/nav.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, NavComponent],
  templateUrl: './terms.component.html',
  styleUrl: './terms.component.scss',
})
export class TermsComponent implements OnInit {
  public current_term!: any;
  public showDetails: boolean = true;

  ngOnInit(): void {
    //  if width is less than lg then set showDetails to false on init
    if (window.innerWidth < 1024) {
      this.showDetails = false;
    } else {
      this.showDetails = true;
    }
  }

  // listen to width changes and update showDetails
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (event.target.innerWidth < 1024) {
      this.showDetails = false;
    } else {
      this.showDetails = true;
    }
  }

  updateTermDetails(term: any) {
    if (window.innerWidth < 1024) {
      this.showDetails = true;
    }
    this.current_term = term;
  }
}
