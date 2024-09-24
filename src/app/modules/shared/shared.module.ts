import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notifications/notification.service';
import { SrcObjectDirective } from '../../directives/communication/src-object.directive';

@NgModule({
  declarations: [SrcObjectDirective],
  imports: [CommonModule],
  providers: [NotificationService],
  exports: [SrcObjectDirective],
})
export class SharedModule {}
