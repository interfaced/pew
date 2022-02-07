import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { BlasterEvent, EventSignal } from 'src/types/pew/blaster';
import { EventType } from 'src/types/pew/types';
import { Remote, RemoteBtn } from 'src/types/remote';
import { Protocols } from 'src/external/protocols';
import { Key } from 'src/types/key';

@Component({
  selector: 'app-remote',
  templateUrl: './remote.component.html',
  styleUrls: ['./remote.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RemoteComponent implements OnInit, OnChanges {
  @Input()
  remote: (Remote | undefined);

  @Output()
  onPress = new EventEmitter<BlasterEvent>()

  rows: number = 0;
  cols: number = 0;

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges): void {
     if (changes['remote']) {
       this.prepare();
     }
  }

  ngOnInit(): void {
    this.prepare();
  }

  gridArea(idx: number, jdx: number, btn: RemoteBtn) {
    return (idx + 1) + '/' + (jdx + 1) + '/' + (btn.spanY ? 'span ' + btn.spanY : 'auto') + '/' + (btn.spanX ? 'span ' + btn.spanX : 'auto');
  }

  onBtnPress(btn: RemoteBtn) {
    if (!btn.key) {
      return;
    }

    const key = this.remote?.keycodes[btn.key];

    if (!key) {
      return;
    }

    this.onPress.emit(new BlasterEvent({
        type: EventType.EVENT_SIGNAL,
        data: new EventSignal({
          protocol: this.remote?.protocol || Protocols.UNKNOWN,
          code: key.code,
          nbits: key.nbits
        })}
      )
    );
  }

  private prepare() {
    const grid = this.remote?.layout || [];
    this.rows = grid.length;
    this.cols = Math.max.apply(Math.max, grid.map((r) => r.length));
  }
}
