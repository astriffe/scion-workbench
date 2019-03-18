/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable, Injector } from '@angular/core';
import { ACTION_CAPABILITY } from './metadata';
import { WorkbenchService } from '@scion/workbench';
import { ManifestRegistry } from '../core/manifest-registry.service';
import { PlatformCapabilityTypes } from '@scion/workbench-application-platform.api';
import { ActionComponent } from './action/action.component';
import { PortalInjector } from '@angular/cdk/portal';
import { ActionCapability } from '@scion/workbench-application-platform.api/lib/action.model';
import { Initializer } from '@scion/workbench-application-platform';

/**
 * Opens a workbench view for intents of the type 'view'.
 *
 * This class acts as mediator between view intents and view capabilities.
 *
 * If an application intends to navigate to a view, the respective view capability(-ies)
 * is looked up to provide metadata about the page to navigate to.
 */
@Injectable()
export class ActionRegisterService implements Initializer {
  constructor(private _workbench: WorkbenchService,
              private _injector: Injector,
              private _manifestRegistry: ManifestRegistry) {
  }

  public onInit(): void {
    this._manifestRegistry.getCapabilitiesByType(PlatformCapabilityTypes.Action)
      .filter((actionCapability: ActionCapability) => !actionCapability.metadata.proxy)
      .filter((actionCapability: ActionCapability) => actionCapability.properties.location === 'view-part')
      .forEach((actionCapability: ActionCapability) => {
        const injectionTokens = new WeakMap();
        injectionTokens.set(ACTION_CAPABILITY, actionCapability);
        const injector = new PortalInjector(this._injector, injectionTokens);
        this._workbench.registerViewPartAction({
          templateOrComponent: {component: ActionComponent, injector: injector},
          align: actionCapability.properties.align,
        });
      });
  }
}

