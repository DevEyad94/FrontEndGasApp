import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagementNavComponent } from './management-nav.component';

describe('ManagementNavComponent', () => {
  let component: ManagementNavComponent;
  let fixture: ComponentFixture<ManagementNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagementNavComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagementNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
