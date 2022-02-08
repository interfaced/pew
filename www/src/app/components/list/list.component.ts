import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';

import IRBlaster from 'src/types/pew/blaster';
import { BlastersService } from '@services/blasters.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {
  public list$: Observable<IRBlaster[]> = this.activatedRoute.snapshot.data['blasters'];

  constructor(
    private blasterScanner: BlastersService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {}
}
