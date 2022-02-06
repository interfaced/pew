import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BlasterEvent, EventSignal, EventSleep } from 'src/types/pew/blaster';
import { ProtocolName } from 'src/types/remote';
import { Protocols } from 'src/external/protocols';

@Component({
  selector: 'app-blaster-event',
  templateUrl: './blaster-event.component.html',
  styleUrls: ['./blaster-event.component.css']
})
export class BlasterEventComponent {
  @Input()
  event: BlasterEvent = {} as BlasterEvent;

  @Input()
  order: number = -1;

  @Input()
  isLast: boolean = false;

  @Output()
  onDelete = new EventEmitter<void>();

  @Output()
  onClone = new EventEmitter<void>();

  @Output()
  onEdit = new EventEmitter<void>();

  constructor() {}

  isSignal(event: BlasterEvent): event is BlasterEvent<EventSignal> {
    return event.data instanceof EventSignal;
  }

  isSleep(event: BlasterEvent): event is BlasterEvent<EventSleep> {
    return event.data instanceof EventSleep;
  }

  getProtocol(event: BlasterEvent<EventSignal>) {
    return ProtocolName[event.data.protocol] || 'Unknown'
  }
}
