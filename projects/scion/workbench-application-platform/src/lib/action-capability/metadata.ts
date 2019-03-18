/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { InjectionToken } from '@angular/core';
import { ActionCapability } from '@scion/workbench-application-platform.api/lib/action.model';

/**
 * Path param to contain the capability id.
 */
export const ACTION_CAPABILITY_ID_PARAM = 'capabilityId';
/**
 * Path param to contain the view path.
 */
export const ACTION_PATH_PARAM = 'path';

/**
 * DI injection token to inject the ...
 */
export const ACTION_CAPABILITY = new InjectionToken<ActionCapability>('ACTION_CAPABILITY');
