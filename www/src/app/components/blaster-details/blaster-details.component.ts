import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BlasterJob } from '../../../types/job';
import IRBlaster, { BlasterEvent } from 'src/types/pew/blaster';
import { Protocols, EventType } from 'src/types/pew/types';
import { RemotesService } from '@services/remotes.service';

@Component({
  selector: 'app-blaster-details',
  templateUrl: './blaster-details.component.html',
  styleUrls: ['./blaster-details.component.css']
})
export class BlasterDetailsComponent implements OnInit {
  job: BlasterJob = {
    name: 'Запуск DEV',
    items: Array(11).fill({
      type: EventType.EVENT_SIGNAL,
      code: 243699,
      protocol: Protocols.NEC
    })
  };

  blaster: IRBlaster = this.route.snapshot.data['blaster'];

  activeIdx: number = -1;

  constructor(
    public remotes: RemotesService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {}

  add(event: (BlasterEvent)) {
    this.job.items.splice(this.job.items.length, 0, event);
  }

  addJob() {

  }

  onEditEvent(idx: number, list: BlasterJob) {
    // console.log(idx, list);
  }
}
