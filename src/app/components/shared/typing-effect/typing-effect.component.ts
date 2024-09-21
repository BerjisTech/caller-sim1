import { Component } from '@angular/core';

@Component({
  selector: 'app-typing-effect',
  standalone: true,
  imports: [],
  templateUrl: './typing-effect.component.html',
  styleUrl: './typing-effect.component.scss',
})
export class TypingEffectComponent {
  public text: string = '';
  public textArray: string[] = [];
  public textArrayIndex: number = 0;
  public textIndex: number = 0;
  public typingEffectInterval: any;

  constructor() {
    this.textArray = [
      'Are you tired of your workplace?',
      'Or happy about it?',
      'Do you hate your boss',
      'You coworkers?',
      'Or maybe like them a lot?',
      'But they hate your guts?',
      'Join in!',
      'This is the private staff only lobby to cool off',
      'And talk about your workplace',
      'Or even share ideas',
      'Or just vent',
    ];
    this.typingEffectInterval = setInterval(() => {
      this.typingEffect();
    }, 100);
  }

  typingEffect() {
    if (this.textIndex < this.textArray[this.textArrayIndex].length) {
      this.text += this.textArray[this.textArrayIndex].charAt(this.textIndex);
      this.textIndex++;
    } else {
      clearInterval(this.typingEffectInterval);
      setTimeout(() => {
        this.typingEffectInterval = setInterval(() => {
          this.deletingEffect();
        }, 50);
      }, 2000);
    }
  }

  deletingEffect() {
    if (this.textIndex >= 0) {
      this.text = this.text.slice(0, this.textIndex);
      this.textIndex--;
    } else {
      clearInterval(this.typingEffectInterval);
      this.textArrayIndex++;
      if (this.textArrayIndex >= this.textArray.length) {
        this.textArrayIndex = 0;
      }
      setTimeout(() => {
        this.typingEffectInterval = setInterval(() => {
          this.typingEffect();
        }, 100);
      }, 1000);
    }
  }
}
