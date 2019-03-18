/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Capability, PlatformCapabilityTypes, Qualifier } from './core.model';
import { PopupIntentPayload, ViewIntentPayload } from '@scion/workbench-application-platform.api';

/**
 * Capability to show an application page as a workbench view.
 */
export interface ActionCapability extends Capability {

  type: PlatformCapabilityTypes.Action;

  properties: {
    /**
     * Specifies the location where the action should be visualized
     *
     * Example location: 'view-part'
     */
    location: string;
    /**
     * Specifies the title to be displayed in the view tab.
     */
    title: string;
    /**
     * Specifies the text for the activity item.
     *
     * You can use it in combination with `cssClass`, e.g. to render an icon glyph by using its textual name.
     */
    text: string;
    /**
     * Specifies CSS class(es) added to the <wb-view-tab> and <wb-view> elements, e.g. used for e2e testing.
     */
    cssClass: string | string[];
    /**
     * Specifies where the action will be visualized
     */
    align: 'start' | 'end';
    /**
     * The intent to be fired
     */
    intent: {
      /**
       * Type of the intent
       */
      type: string;
      /**
       * Qualifier of the intent
       */
      qualifier: Qualifier;
      /**
       * Payload (if needed) for the intent, choose the right one for the intent-type
       */
      properties?: ViewIntentPayload | PopupIntentPayload | any;
    }
  };
}
