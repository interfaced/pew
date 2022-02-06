import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BlastersService } from '@services/blasters.service';

@Component({
  selector: 'app-mqtt-form',
  templateUrl: './mqtt-form.component.html',
  styleUrls: ['./mqtt-form.component.css']
})
export class MqttFormComponent implements OnInit {
  inputGroup = new FormGroup({
    server: new FormControl(''),
  });

  constructor(
    private blasterScanner: BlastersService,
    private router : Router
  ) { }

  ngOnInit(): void {
  }

  onSubmit() {
    this.blasterScanner.setMqttUrl(this.inputGroup.value.server);
    this.blasterScanner.init()
      .then(() => {
        return this.router.navigate([''])
      });
  }
}
