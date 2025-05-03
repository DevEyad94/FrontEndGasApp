import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionRecordComponent } from './production-record.component';

describe('ProductionRecordComponent', () => {
  let component: ProductionRecordComponent;
  let fixture: ComponentFixture<ProductionRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductionRecordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductionRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
