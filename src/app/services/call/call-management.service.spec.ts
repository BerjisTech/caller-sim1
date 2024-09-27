import { TestBed } from '@angular/core/testing';

import { CallManagementService } from './call-management.service';

describe('CallManagementService', () => {
  let service: CallManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CallManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
