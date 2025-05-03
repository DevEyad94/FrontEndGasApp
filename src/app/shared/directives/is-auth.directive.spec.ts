import { IsAuthDirective } from './is-auth.directive';
import { Component, TemplateRef, ViewContainerRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';

// Mock AuthService
class MockAuthService {
  currentUser$ = of(null);
}

describe('IsAuthDirective', () => {
  let templateRef: jasmine.SpyObj<TemplateRef<any>>;
  let viewContainer: jasmine.SpyObj<ViewContainerRef>;
  let authService: MockAuthService;

  beforeEach(() => {
    templateRef = jasmine.createSpyObj('TemplateRef', ['elementRef']);
    viewContainer = jasmine.createSpyObj('ViewContainerRef', ['createEmbeddedView', 'clear']);
    authService = new MockAuthService();

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService }
      ]
    });
  });

  it('should create an instance', () => {
    const directive = new IsAuthDirective(viewContainer, templateRef, authService as any);
    expect(directive).toBeTruthy();
  });
});
