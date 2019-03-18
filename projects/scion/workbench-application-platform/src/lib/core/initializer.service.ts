/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Inject, Injectable } from '@angular/core';
import { Initializer, INITIALIZER } from './metadata';

/**
 * Calls initializers registered via {INITIALIZER} DI injection token.
 *
 * @see Initializer
 */
@Injectable()
export class InitializerService {

  constructor(@Inject(INITIALIZER) private _initializer: Initializer[]) {
  }

  public initialize(): void {
    this._initializer.forEach(initialzer => initialzer.onInit());
  }
}
