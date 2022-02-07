import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { RemotesService } from '@services/remotes.service';
import { Observable } from 'rxjs';
import { BlasterEvent, EventSignal, EventSleep } from 'src/types/pew/blaster';
import { ProtocolName } from 'src/types/remote';
import { Protocols } from 'src/external/protocols';

@Component({
  selector: 'app-blaster-event',
  templateUrl: './blaster-event.component.html',
  styleUrls: ['./blaster-event.component.css']
})
export class BlasterEventComponent implements OnInit {
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

  eventValue = new FormControl('');

  constructor(
    public remotes: RemotesService
  ) {}

  ngOnInit(): void {
    this.eventValue.setValue(this.isSleep(this.event) ? this.event.data.ms : '');
  }

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
