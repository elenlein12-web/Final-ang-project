import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookedComponent } from './booked';
import { ApiService } from '../services/api';
import { AuthService } from '../services/auth';

describe('BookedComponent', () => {
  let component: BookedComponent;
  let fixture: ComponentFixture<BookedComponent>;
  let api: {
    getHotel: ReturnType<typeof vi.fn>;
    getBookings: ReturnType<typeof vi.fn>;
    createBooking: ReturnType<typeof vi.fn>;
    deleteBooking: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    api = {
      getHotel: vi.fn().mockResolvedValue({ rooms: [] }),
      getBookings: vi.fn().mockResolvedValue([]),
      createBooking: vi.fn().mockResolvedValue({}),
      deleteBooking: vi.fn().mockResolvedValue({})
    };

    await TestBed.configureTestingModule({
      imports: [BookedComponent],
      providers: [
        { provide: ApiService, useValue: api },
        { provide: AuthService, useValue: { userPhone: '555123456' } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookedComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('posts the booking payload expected by the API', async () => {
    component.rooms = [{ id: 7, name: 'Suite', pricePerNight: 150 }];
    component.bookingModel = {
      roomId: '7',
      checkInDate: '2026-05-20',
      checkOutDate: '2026-05-22',
      clientName: ' Test User ',
      clientPhone: ' 555123456 ',
      customerId: ' ID-123 '
    };

    await component.book();

    expect(api.getBookings).not.toHaveBeenCalled();
    expect(api.createBooking).toHaveBeenCalledWith({
      id: 0,
      roomID: 7,
      checkInDate: '2026-05-20T00:00:00.000Z',
      checkOutDate: '2026-05-22T00:00:00.000Z',
      totalPrice: 300,
      isConfirmed: true,
      customerName: 'Test User',
      customerId: 'ID-123',
      customerPhone: '555123456'
    });
  });
});
