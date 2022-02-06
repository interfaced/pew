import { CdkDragDrop, copyArrayItem, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BlasterJob } from 'src/types/job';

@Component({
  selector: 'app-blaster-job',
  templateUrl: './blaster-job.component.html',
  styleUrls: ['./blaster-job.component.css']
})
export class BlasterJobComponent implements OnInit {
  @Input()
  job!: BlasterJob;

  @Input()
  activeIdx!: number;

  @Output()
  activeIdxChanged = new EventEmitter<number>();

  isExpanded = false;

  jobName = new FormControl();

  constructor() {
  }

  ngOnInit(): void {
    this.jobName.setValue(this.job.name);
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
}
