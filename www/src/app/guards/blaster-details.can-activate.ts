import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { take } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { BlastersService } from '@services/blasters.service';

@Injectable()
export default class CanActivateBlasterDetails implements CanActivate {
  constructor(
    private blasterScanner: BlastersService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    return this.blasterScanner.blasters.pipe(
      take(1),
      map((list) => {
        return !!list.find((blaster) => (blaster as any).id === route.params['id']);
      }),
      tap((result) => {
        if (!result) {
          this.router.navigate(['/']);
        }
      })
    );
  }
}
