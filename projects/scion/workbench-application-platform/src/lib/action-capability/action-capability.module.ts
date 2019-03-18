/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { NgModule } from '@angular/core';
import { CoreModule } from '../core/core.module';
import { WorkbenchModule } from '@scion/workbench';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ActionRegisterService } from './action-register.service';
import { ActionComponent } from './action/action.component';
import { INITIALIZER } from '../core/metadata';

/**
 * Built-in capability to show a view.
 */
@NgModule({
  declarations: [
    ActionComponent,
  ],
  imports: [
    CommonModule,
    CoreModule,
    WorkbenchModule.forChild(),
    RouterModule.forChild([]),
  ],
  providers: [
    {provide: INITIALIZER, useClass: ActionRegisterService, multi: true},
  ],
  entryComponents: [
    ActionComponent,
  ]
})
export class ActionCapabilityModule {
}

