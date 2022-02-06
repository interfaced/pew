import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Directive, ElementRef, Input, ViewContainerRef } from '@angular/core';
import { first, map, merge, Observable, of, Subscription } from 'rxjs';
import { DropdownComponent } from '@components/dropdown/dropdown.component';

@Directive({
  selector: '[appDropdownButton]',
  host: {
    '(click)': 'toggleDropdown()'
  }
})
export class DropdownButtonDirective {
  private isDropdownOpen = false;

  @Input('appDropdownButton')
  public dropdownPanel!: DropdownComponent;

  private overlayRef: OverlayRef | null = null;
  private dropdownClosingActions$ = Subscription.EMPTY;

  constructor(
    private overlay: Overlay,
    private elementRef: ElementRef<HTMLElement>,
    private viewContainerRef: ViewContainerRef
  ) {
  }

  toggleDropdown(): void {
    this.isDropdownOpen ? this.destroyDropdown() : this.openDropdown();
  }

  private openDropdown(): void {
    this.isDropdownOpen = true;
    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: ['bg-slate-900', 'bg-opacity-50', 'z-[-1]'],
      scrollStrategy: this.overlay.scrollStrategies.close(),
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(this.elementRef)
        .withPositions([
          {
            originX: 'start',
            originY: 'top',
            overlayX: 'end',
            overlayY: 'top'
          }
        ])
    });

    const templatePortal = new TemplatePortal(
      this.dropdownPanel.templateRef,
      this.viewContainerRef
    );
    this.overlayRef.attach(templatePortal);

    this.dropdownClosingActions$ = this.dropdownClosingActions()
      .subscribe(
        () => this.destroyDropdown()
      );
  }

  private dropdownClosingActions(): Observable<void> {
    if (!this.overlayRef) {
      return of(undefined);
    }

    const backdropClick$ = this.overlayRef.backdropClick();
    const detachment$ = this.overlayRef.detachments();
    const dropdownClosed = this.dropdownPanel.closed;

    return merge(backdropClick$, detachment$, dropdownClosed)
      .pipe(
        first(),
        map(() => undefined)
      );
  }

  private destroyDropdown(): void {
    if (!this.overlayRef || !this.isDropdownOpen) {
      return;
    }

    this.dropdownClosingActions$.unsubscribe();
    this.isDropdownOpen = false;
    this.overlayRef.detach();
  }
}
