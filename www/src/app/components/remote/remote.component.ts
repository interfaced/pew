import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BlasterEvent, EventSignal } from 'src/types/pew/blaster';
import { EventType } from 'src/types/pew/types';
import { Remote, RemoteBtn } from 'src/types/remote';
import { Protocols } from 'src/external/protocols';

@Component({
  selector: 'app-remote',
  templateUrl: './remote.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./remote.component.css'],
})
export class RemoteComponent implements OnInit {
  @Input()
  remote: (Remote|undefined);

  @Output()
  onPress = new EventEmitter<BlasterEvent>()

  rows: number = 0;
  cols: number = 0;

  constructor() { }

  ngOnInit(): void {
    const grid = this.remote?.layout || [];
    this.rows = grid.length;
    this.cols = Math.max.apply(Math.max, grid.map((r) => r.length));
  }

  gridArea(idx: number, jdx: number, btn: RemoteBtn) {
    return (idx + 1) + '/' + (jdx + 1) + '/' + (btn.spanY ? 'span ' + btn.spanY : 'auto') + '/' + (btn.spanX ? 'span ' + btn.spanX : 'auto');
  }

  onBtnPress(btn: RemoteBtn) {
    if (!btn.key) {
      return;
    }

    this.onPress.emit(new BlasterEvent({
        type: EventType.EVENT_SIGNAL,
        data: new EventSignal({
          protocol: this.remote?.protocol || Protocols.UNKNOWN,
          code: btn.key as any
        })}
      )
    );
  }
}
