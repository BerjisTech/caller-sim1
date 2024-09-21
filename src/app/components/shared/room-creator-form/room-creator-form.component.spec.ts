import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomCreatorFormComponent } from './room-creator-form.component';

describe('RoomCreatorFormComponent', () => {
  let component: RoomCreatorFormComponent;
  let fixture: ComponentFixture<RoomCreatorFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomCreatorFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomCreatorFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
