import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';

interface Option<T> {
  label: string;
  value: T
}

@Component({
  selector: 'app-status-btn',
  templateUrl: './status-btn.component.html',
  styleUrls: ['./status-btn.component.css']
})
export class StatusBtnComponent<T> implements OnInit {
  @Input()
  label: string = '';

  @Input()
  icon: string = '';

  @Input()
  status: string = '';

  @Input()
  options: Option<T>[] = [];

  @Input()
  isEnum: boolean = false;

  @Input()
  glow: Record<string, boolean> = {};

  @Output()
  statusChange = new EventEmitter<T>();

  constructor() { }

  ngOnInit(): void {
  }

  onClick() {
    if (!this.options.length || this.options.length === 1) {
      return;
    }

    if (this.isEnum) {
      const currentIdx = this.options.findIndex((opt) => opt.value);
      let nextIdx = currentIdx + 1;

      if (currentIdx + 1 > this.options.length - 1) {
        nextIdx = 0;
      }

      this.onSelect(this.options[nextIdx].value);
    }
  }

  onSelect(value: T) {
    this.statusChange.emit(value);
  }
}
