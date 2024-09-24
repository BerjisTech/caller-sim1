// src/app/directives/src-object.directive.ts
import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appSrcObject]',
})
export class SrcObjectDirective implements OnChanges {
  @Input('appSrcObject') srcObject!: MediaStream;

  constructor(private el: ElementRef<HTMLVideoElement>) {}

  ngOnChanges(changes: SimpleChanges) {
    if (this.srcObject) {
      this.el.nativeElement.srcObject = this.srcObject;
    }
  }
}
