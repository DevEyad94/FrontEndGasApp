import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() showMobileMenu: boolean = false;
  @Output() logout = new EventEmitter<void>();
  @Output() toggleMobileMenu = new EventEmitter<void>();

  onLogout(): void {
    this.logout.emit();
  }

  onToggleMobileMenu(): void {
    this.toggleMobileMenu.emit();
  }
}
