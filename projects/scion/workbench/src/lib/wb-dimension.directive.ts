import { Directive, DoCheck, ElementRef, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output } from '@angular/core';
import { fromEvent, interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export const NULL_DIMENSION: Dimension = {offsetWidth: 0, offsetHeight: 0, clientWidth: 0, clientHeight: 0};

/**
 * Notifies upon a component dimension change.
 */
@Directive({
  selector: '[wbDimension]'
})
export class DimensionDirective implements OnInit, DoCheck, OnDestroy {

  private _host: HTMLElement;
  private _dimension: Dimension = NULL_DIMENSION;
  private _destroy$ = new Subject<void>();

  @Output()
  public wbDimensionChange = new EventEmitter<Dimension>();


  /**
   * By default, dimension change is detected in 'ngDoCheck' lifecycle hook.
   *
   * However, 'ngDoCheck' is not fired for components which are child components of components with 'OnPush' change detection strategy.
   *
   * If so, set this property to 'true' to detect dimension changes when a periodic timer fires.
   */
  @Input('wbDimensionUseTimer') // tslint:disable-line:no-input-rename
  public useTimer: boolean;

  constructor(host: ElementRef, private _ngZone: NgZone) {
    this._host = host.nativeElement as HTMLElement;

    // run outside Angular zone to not trigger app ticks on every event
    this._ngZone.runOutsideAngular(() => {
      fromEvent(window, 'resize')
        .pipe(takeUntil(this._destroy$))
        .subscribe(() => this.checkDimension());
    });
  }

  public ngOnInit(): void {
    this.useTimer && this._ngZone.runOutsideAngular(() => {
      interval(50)
        .pipe(takeUntil(this._destroy$))
        .subscribe(() => this.checkDimension());
    });
  }

  public ngDoCheck(): void {
    // Let Angular update the DOM first before checking for dimension change.
    // Run the timer outside the Angular zone to not trigger an app tick.
    this._ngZone.runOutsideAngular(() => setTimeout(this.checkDimension.bind(this)));
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }

  private checkDimension(): void {
    const newDimension = {
      offsetWidth: this._host.offsetWidth,
      offsetHeight: this._host.offsetHeight,
      clientWidth: this._host.clientWidth,
      clientHeight: this._host.clientHeight,
    };

    if (this._dimension.offsetWidth === newDimension.offsetWidth
      && this._dimension.offsetHeight === newDimension.offsetHeight
      && this._dimension.clientWidth === newDimension.clientWidth
      && this._dimension.clientHeight === newDimension.clientHeight) {
      return;
    }

    this._dimension = newDimension;
    this._ngZone.run(() => this.wbDimensionChange.emit(this._dimension));
  }
}

export interface Dimension {
  offsetWidth: number;
  offsetHeight: number;
  clientWidth: number;
  clientHeight: number;
}
