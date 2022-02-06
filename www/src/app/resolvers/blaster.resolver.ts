import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, take } from 'rxjs';
import { map } from 'rxjs/operators';
import IRBlaster from 'src/types/pew/blaster';
import { BlastersService } from '@services/blasters.service';

@Injectable({
  providedIn: 'root'
})
export class BlasterResolver implements Resolve<IRBlaster> {
  constructor(
    private blasterScanner: BlastersService
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IRBlaster> {
    return this.blasterScanner
      .blasters
      .pipe(
        take(1),
        map((blasters) => blasters.find(blaster => route.params['id'] === (blaster as any).id) as IRBlaster),
      );
  }
}
