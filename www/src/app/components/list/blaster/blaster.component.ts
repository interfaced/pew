import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { catchError, Observable, of, shareReplay, Subject, takeUntil } from 'rxjs';
import { filter } from 'rxjs/operators';
import IRBlaster from 'src/types/pew/blaster';
import { BlasterStatus, IRStatus, ModeStatus, NetworkStatus, PowerStatus } from 'src/types/pew/types';

@Component({
  selector: 'app-blaster',
  templateUrl: './blaster.component.html',
  styleUrls: ['./blaster.component.css']
})
export class BlasterComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  blaster!: IRBlaster;

  private statusTrigger$ = new Subject();
  private destroy$ = new Subject();
  public status$: Observable<BlasterStatus> = of({
    mode: ModeStatus.UNKNOWN,
    power: PowerStatus.UNKNOWN,
    network: NetworkStatus.UNKNOWN,
    ir: IRStatus.UNKNOWN
  });

  blasterModes = [
    {
      label: 'Wall',
      value: ModeStatus.WALL
    },
    {
      label: 'Transparent',
      value: ModeStatus.TRANSPARENT
    }
  ];

  powerModes = [
    {
      label: 'ON',
      value: PowerStatus.ON
    },
    {
      label: 'OFF',
      value: PowerStatus.OFF
    }
  ];

  networkModes = [
    {
      label: 'Online',
      value: NetworkStatus.ONLINE
    },
    {
      label: 'Offline',
      value: NetworkStatus.OFFLINE
    },
    {
      label: 'Off',
      value: NetworkStatus.OFF
    }
  ];

  constructor() {
  }

  ngOnInit(): void {
    this.status$ = this.blaster.status$.pipe(
      filter(Boolean),
      catchError(() => {
        return of({
          mode: ModeStatus.UNKNOWN,
          power: PowerStatus.UNKNOWN,
          network: NetworkStatus.UNKNOWN,
          ir: IRStatus.UNKNOWN
        })
      }),
      shareReplay({ refCount: true, bufferSize: 1 }),
      takeUntil(this.destroy$)
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['blaster']) {
      this.statusTrigger$.next(null);
    }
  }

  get name() {
    return this.blaster?.name || 'ᓰᖇᗷᒪᗩSᖶᘿᖇ';
  }

  parseStatus(status: keyof BlasterStatus, value: any): string {
    if (status === 'mode') {
      return this.blasterModes.find((m) => m.value === value)?.label || '-';
    }
    if (status === 'power') {
      return this.powerModes.find((m) => m.value === value)?.label || '-';
    }
    if (status === 'network') {
      return this.networkModes.find((m) => m.value === value)?.label || '-';
    }

    return '-';
  }

  parseIcon(status: keyof BlasterStatus, value: ModeStatus|PowerStatus|NetworkStatus): string {
    if (status === 'mode') {
      switch (value) {
        case ModeStatus.TRANSPARENT:
          return 'icon-transparent';
        case ModeStatus.WALL:
          return 'icon-wall';
        default:
          return 'icon-cross';
      }
    }

    return 'icon-';
  }

  applyGlowColor(status: keyof BlasterStatus, value: ModeStatus|PowerStatus|NetworkStatus): Record<string, boolean> {
    if (status === 'power') {
      return {
        'shadow-green-500 hover:shadow-green-500': value === PowerStatus.ON,
        'shadow-red-500 hover:shadow-red-500': value === PowerStatus.OFF,
      }
    }

    if (status === 'network') {
      return {
        'shadow-sky-500 hover:shadow-sky-500': value === NetworkStatus.ONLINE,
        'shadow-orange-500 hover:shadow-orange-500': value === NetworkStatus.OFFLINE,
        'shadow-red-500 hover:shadow-red-500': value === NetworkStatus.OFF
      }
    }

    return {};
  }

  onStatusChange(status: keyof BlasterStatus, value: ModeStatus|PowerStatus|NetworkStatus) {
    this.blaster.setStatus({
      [status]: value
    });
  }
}
