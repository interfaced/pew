import { Injectable } from '@angular/core';
import {
  Router,
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { first, Observable, of, take } from 'rxjs';
import { tap } from 'rxjs/operators';
import IRBlaster from 'src/types/pew/blaster';
import { BlastersService } from '@services/blasters.service';

@Injectable({
  providedIn: 'root'
})
export class BlastersResolver implements Resolve<Observable<IRBlaster[]>> {
  constructor(
    private blasterScanner: BlastersService,
    private router: Router
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Observable<IRBlaster[]>> {
    return of(this.blasterScanner.blasters);
  }
}
