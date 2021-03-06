/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Directive, ElementRef, EventEmitter, Input, NgZone, OnDestroy, Output } from '@angular/core';
import { asapScheduler, fromEvent, merge, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, map, startWith, takeUntil } from 'rxjs/operators';

export const NULL_DIMENSION: SciDimension = {offsetWidth: 0, offsetHeight: 0, clientWidth: 0, clientHeight: 0};

/**
 * Allows observing changes to host element's size.
 *
 * This directive can be used in 'Default' or 'OnPush' change detection context.
 *
 * ---
 * Usage:
 * <div sciDimension (sciDimensionChange)="onDimensionChange($event)"></div>
 */
@Directive({
  selector: '[sciDimension]',
  exportAs: 'sciDimension',
})
export class SciDimensionDirective implements OnDestroy {

  private _host: HTMLElement;
  private _destroy$ = new Subject<void>();

  /**
   * Emits when the dimension of the host element changes.
   */
  @Output('sciDimensionChange') // tslint:disable-line:no-output-rename
  public dimensionChange = new EventEmitter<SciDimension>();

  /**
   * Controls if to emit a dimension change inside or outside of the Angular zone.
   * If emitted outside of the Angular zone no change detection cycle is triggered.
   */
  @Input()
  public emitOutsideAngular: boolean;

  constructor(host: ElementRef, private _ngZone: NgZone) {
    this._host = host.nativeElement as HTMLElement;

    // run outside of the Angular zone to not trigger app ticks on every event
    this._ngZone.runOutsideAngular(() => {
      this.dimensionChange$()
        .pipe(takeUntil(this._destroy$))
        .subscribe((dimension: SciDimension) => {
          if (this.emitOutsideAngular) {
            this.emitDimensionChange(dimension);
          }
          else {
            this._ngZone.run(() => this.emitDimensionChange(dimension));
          }
        });
    });
  }

  /**
   * Returns the current dimension of its host element.
   */
  public get dimension(): SciDimension {
    return {
      clientWidth: this._host.clientWidth,
      clientHeight: this._host.clientHeight,
      offsetWidth: this._host.offsetWidth,
      offsetHeight: this._host.offsetHeight
    };
  }

  /**
   * Emits when the dimension of the host element changes.
   *
   * This is a workaround until it is possible to listen for element dimension changes natively.
   * @see https://wicg.github.io/ResizeObserver/
   */
  private dimensionChange$(): Observable<SciDimension> {
    NgZone.assertNotInAngularZone();

    return merge(
      this._ngZone.onStable, // When the Angular zone gets stable the dimension of the host element might have changed.
      fromEvent(window, 'resize'), // However, when resizing the window, the Angular zone is not necessarily involved.
    )
      .pipe(
        map(() => this.dimension),
        startWith(NULL_DIMENSION, asapScheduler),
        distinctUntilChanged((a, b) => {
          return a.clientWidth === b.clientWidth &&
            a.clientHeight === b.clientHeight &&
            a.offsetWidth === b.offsetWidth &&
            a.offsetHeight === b.offsetHeight;
        }),
      );
  }

  private emitDimensionChange(dimension: SciDimension): void {
    this.dimensionChange.emit(dimension);
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
  }
}

/**
 * Emitted upon a host element size change.
 */
export interface SciDimension {
  offsetWidth: number;
  offsetHeight: number;
  clientWidth: number;
  clientHeight: number;
}
