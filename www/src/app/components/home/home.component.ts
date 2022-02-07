import { Component, OnInit } from '@angular/core';
import { BlastersService } from '@services/blasters.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(
    public blastersService: BlastersService
  ) { }

  ngOnInit(): void {
  }

}
