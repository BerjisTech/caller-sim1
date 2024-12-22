import { TestBed } from '@angular/core/testing';

import { PreviewStreamService } from './preview-stream.service';

describe('PreviewStreamService', () => {
  let service: PreviewStreamService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PreviewStreamService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
