/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { ChangeDetectionStrategy, Component, Inject, Injector } from '@angular/core';
import { MessageBus } from '../../core/message-bus.service';
import { IntentMessage } from '@scion/workbench-application-platform.api';
import { ACTION_CAPABILITY } from '../metadata';
import { ActionCapability } from '@scion/workbench-application-platform.api/lib/action.model';

/**
 * Button to fire an intent.
 */
@Component({
  selector: 'wap-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionComponent {

  constructor(@Inject(ACTION_CAPABILITY) public actionCapability: ActionCapability,
              private _messageBus: MessageBus,
              private _injector: Injector) {
  }

  public onClick(event: Event): void {
    event.preventDefault(); // prevent UA to follow 'href'
    const intentMessage: IntentMessage = {
      type: this.actionCapability.properties.intent.type,
      qualifier: this.actionCapability.properties.intent.qualifier,
      payload: this.actionCapability.properties.intent.properties ? this.actionCapability.properties.intent.properties : {},
    };
    this._messageBus.publishMessageIfQualified({channel: 'intent', message: intentMessage}, this.actionCapability.metadata.symbolicAppName, {injector: this._injector});
  }
}
