import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookedComponent } from './booked';

describe('BookedComponent', () => {
  let component: BookedComponent;
  let fixture: ComponentFixture<BookedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookedComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BookedComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
