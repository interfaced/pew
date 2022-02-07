import { CdkDragDrop, copyArrayItem, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { BlasterJob } from 'src/types/job';
import { EventSleep } from '../../../types/pew/blaster';
import {CommandType} from '../../../types/pew/types';

@Component({
  selector: 'app-blaster-job',
  templateUrl: './blaster-job.component.html',
  styleUrls: ['./blaster-job.component.css']
})
export class BlasterJobComponent implements OnInit {
  @Input()
  job!: BlasterJob;

  @Input()
  activeIdx: number = -1;

  @Input()
  isActive: boolean = false;

  @Input()
  isBusy: boolean = false;

  @Output()
  activeIdxChanged = new EventEmitter<number>();

  @Output()
  sendIrCommand = new EventEmitter<number>();

  @Output()
  onRecordStatus = new EventEmitter<boolean>();

  @Output()
  onRun = new EventEmitter<void>();

  isExpanded = false;

  jobName = new FormControl();

  isRecording: boolean = false;

  constructor() {
  }

  ngOnInit(): void {
    this.jobName.setValue(this.job.name);
    this.isExpanded = !this.job?.items?.length;
  }

  drop(event: CdkDragDrop<number, any>) {
    moveItemInArray(this.job.items, event.previousIndex, event.currentIndex);
  }

  clone(idx: number) {
    copyArrayItem(this.job.items, this.job.items, idx, idx);
  }

  delete(idx: number) {
    transferArrayItem(this.job.items, [], idx, idx)
  }

  edit(idx: number) {
    this.activeIdxChanged.emit(idx);
  }

  sendCommandPlay() {
    this.onRun.emit();
  }

  sendCommandResume() {
    this.sendIrCommand.emit(CommandType.TX_RESUME);
  }

  sendCommandStop() {
    this.sendIrCommand.emit(CommandType.TX_STOP);
  }

  sendCommandPause() {
    this.sendIrCommand.emit(CommandType.TX_PAUSE);
  }

  get estimate(): number {
    return this.job.items
      .filter((event) => event.data instanceof EventSleep)
      .map((event) => (event.data as EventSleep).ms)
      .reduce<number>((acc, event) => acc + event, 0);
  }

  recordToggle() {
    this.isRecording = !this.isRecording;

    this.onRecordStatus.emit(this.isRecording);
  }
}
