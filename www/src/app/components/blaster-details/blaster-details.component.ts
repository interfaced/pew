import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RemotesService } from '@services/remotes.service';
import { Subscription } from 'rxjs';
import IRBlaster, { BlasterEvent, EventSleep } from 'src/types/pew/blaster';
import { BlasterJob } from '../../../types/job';
import { EventType } from '../../../types/pew/types';

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

  add(event: BlasterEvent) {
    const job = this.jobs[this.activeJob.jobIdx];

    if (job) {
      job.items.splice(job.items.length, 0, event);
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

  get activeJobName(): string {
    return `${this.jobs[this.activeJob.jobIdx]?.name || '_________'} ${this.activeJob.eventIdx !== -1 ? `L:${this.activeJob.eventIdx}` : ''}`
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
}
