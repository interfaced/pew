import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { generateEvents } from '@mocks/blaster';
import { BlasterJob } from '../../../types/job';
import IRBlaster, { BlasterEvent } from 'src/types/pew/blaster';
import { RemotesService } from '@services/remotes.service';

@Component({
  selector: 'app-blaster-details',
  templateUrl: './blaster-details.component.html',
  styleUrls: ['./blaster-details.component.css']
})
export class BlasterDetailsComponent implements OnInit {
  jobs: BlasterJob[] = [
    {
      name: 'Запуск DEV',
      items: generateEvents(125)
    }
  ];

  blaster: IRBlaster = this.route.snapshot.data['blaster'];

  activeRemote = new FormControl();

  activeIdx: number = -1;

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

  add(event: BlasterEvent, job: BlasterJob) {
    job.items.splice(job.items.length, 0, event);
  }

  addJob() {
    this.jobs.push({
      name: 'New Scenario',
      items: generateEvents(25)
    });
  }

  onEditEvent(idx: number, list: BlasterJob) {
    // console.log(idx, list);
  }
}
