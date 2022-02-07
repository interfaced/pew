import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { BlasterJob } from '../../../types/job';
import IRBlaster, { BlasterEvent, EventSleep } from 'src/types/pew/blaster';
import { RemotesService } from '@services/remotes.service';
import { CommandType, IRStatus, EventType } from '../../../types/pew/types';

@Component({
  selector: 'app-blaster-details',
  templateUrl: './blaster-details.component.html',
  styleUrls: ['./blaster-details.component.css']
})
export class BlasterDetailsComponent implements OnInit {
  jobs: BlasterJob[] = [];

  blaster: IRBlaster = this.route.snapshot.data['blaster'];

  activeRemote = new FormControl();

  activeJob = {
    eventIdx: -1,
    jobIdx: -1
  };

  private subscribeToOutput: Subscription|null = null;
  private distance: number = 0;

  constructor(
    public remotes: RemotesService,
    private route: ActivatedRoute
  ) {
    this.activeRemote.valueChanges.subscribe((remoteId) => {
      this.remotes.setActive(remoteId);
    });

    this.activeRemote.setValue(this.remotes.list[0]?.id);
  }

  ngOnInit(): void {}

  add(event: BlasterEvent, isAutoSleep: boolean = true) {
    const job = this.jobs[this.activeJob.jobIdx];

    if (job) {
      if (isAutoSleep && job.items.length) {
        job.items.splice(this.activeJob.eventIdx, 0,
          new BlasterEvent({
            type: EventType.EVENT_SLEEP,
            data: new EventSleep({ms: 150})
          })
        );
      }

      job.items.splice(this.activeJob.eventIdx + 1, 0, event);

      this.activeJob.eventIdx = job.items.length;
    }
  }

  addJob() {
    this.jobs.push({
      name: 'New Scenario',
      items: []
    });
  }

  onEditEvent(idx: number, list: BlasterJob) {
    // console.log(idx, list);
  }

  onJobActivate(idx: number) {
    this.activeJob = {
      eventIdx: this.jobs[idx].items.length,
      jobIdx: idx,
    }
  }

  onIrCommand(command: CommandType) {
    this.blaster.sendControlCommand(command);
  }

  get activeJobName(): string {
    return `${this.jobs[this.activeJob.jobIdx]?.name || '_________'} ${this.activeJob.eventIdx !== -1 ? `L:${this.activeJob.eventIdx}` : ''}`
  }

  isBusy() {
    return this.blaster.status$.getValue()?.ir === IRStatus.BUSY;
  }

  onRecordStatusChange(status: boolean) {
    this.subscribeToOutput?.unsubscribe();

    this.distance = Date.now();
    if (status) {
      this.subscribeToOutput = this.blaster.output$
          .subscribe((event) => {
            const currentJob = this.jobs[this.activeJob.jobIdx];

            const newDistance = Date.now();
            currentJob.items.push(new BlasterEvent({
              type: EventType.EVENT_SLEEP,
              data: new EventSleep({ms: newDistance - this.distance})
            }));

            this.distance = newDistance;

            currentJob.items.push(event);
          });
    }
  }

  onRun(job: BlasterJob) {
    this.blaster.send(job.items);
  }
}
