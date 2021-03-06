/*
 * Copyright (c) 2018 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 *  SPDX-License-Identifier: EPL-2.0
 */

import { Injectable } from '@angular/core';
import { Capability, Intent, Qualifier } from '@scion/workbench-application-platform.api';
import { Defined } from './defined.util';
import { sha256 } from 'js-sha256';
import { testQualifier } from './qualifier-tester';

const NilSelector = (capability: Capability): boolean => true;

/**
 * Registry with all registered application capabilities and intents.
 */
@Injectable()
export class ManifestRegistry {

  private _capabilitiesByType = new Map<string, Capability[]>();
  private _capabilitiesById = new Map<string, Capability>();
  private _intentsByApplication = new Map<string, Intent[]>();
  private _intentsById = new Map<string, Intent>();
  private _scopeCheckDisabled = new Set<string>();

  /**
   * Returns capabilities which have the given required type.
   */
  public getCapabilitiesByType<T extends Capability>(type: string): T[] {
    return (this._capabilitiesByType.get(type) || []) as T[];
  }

  /**
   * Returns capabilities of given application.
   */
  public getCapabilitiesByApplication(symbolicName: string): Capability[] {
    return Array.from(this._capabilitiesById.values()).filter(capability => capability.metadata.symbolicAppName === symbolicName);
  }

  /**
   * Returns the capability of given id.
   */
  public getCapability<T extends Capability>(id: string): T {
    return this._capabilitiesById.get(id) as T;
  }

  /**
   * Returns capabilities which have the given required type and qualifiers.
   */
  public getCapabilities<T extends Capability>(type: string, qualifier: Qualifier): T[] {
    return this.getCapabilitiesByType(type).filter(capability => testQualifier(capability.qualifier, qualifier)) as T[];
  }

  /**
   * Returns the intent of given id.
   */
  public getIntent(id: string): Intent {
    return this._intentsById.get(id);
  }

  /**
   * Returns intents which are registered by the given application.
   */
  public getIntentsByApplication(symbolicName: string): Intent[] {
    return this._intentsByApplication.get(symbolicName) || [];
  }

  /**
   * Tests if the application has registered an intent for the given type and qualifiers,
   * or whether the application has an implicit intent because it provides the capability itself.
   */
  public hasIntent(symbolicName: string, type: string, qualifier: Qualifier): boolean {
    return this.getIntentsByApplication(symbolicName).some(intent => {
      return intent.type === type && testQualifier(intent.qualifier, qualifier);
    });
  }

  /**
   * Tests if the application has registered a capability for the given type and qualifiers,
   * and if specified, which also matches the selector function.
   */
  public hasCapability(symbolicName: string, type: string, qualifier: Qualifier, selector: (capability: Capability) => boolean = NilSelector): boolean {
    const capabilities = this.getCapabilities(type, qualifier);
    return capabilities.some(capability => capability.metadata.symbolicAppName === symbolicName && selector(capability));
  }

  /**
   * Tests if some application is capable of handling the given intent.
   * The capability must be provided with public visibility unless provided by the requesting application itself.
   */
  public isHandled(symbolicName: string, type: string, qualifier: Qualifier): boolean {
    return this.getCapabilities(type, qualifier)
      .filter(capability => !capability.metadata.proxy)
      .some(capability => !capability.private || this.isScopeCheckDisabled(symbolicName) || capability.metadata.symbolicAppName === symbolicName);
  }

  /**
   * Registers capabilities of the given application.
   *
   * The parameter 'proxy' indicates the implementor act as a proxy through which intents are processed (which by default is false).
   */
  public registerCapability(symbolicName: string, capabilities: Capability[], proxy: boolean = false): void {
    if (!capabilities || !capabilities.length) {
      return;
    }

    capabilities.forEach(it => {
      const registeredCapabilities = this._capabilitiesByType.get(it.type) || [];
      const capability: Capability = {
        ...it,
        private: Defined.orElse(it.private, true),
        metadata: {
          id: sha256(JSON.stringify({application: symbolicName, type: it.type, ...it.qualifier})).substr(0, 7), // use the first 7 digits of the capability hash as capability id
          symbolicAppName: symbolicName,
          proxy: proxy,
        }
      };

      this._capabilitiesById.set(capability.metadata.id, capability);
      this._capabilitiesByType.set(capability.type, [...registeredCapabilities, capability]);
    });

    // Register implicit intents. These are intents for capabilities which the application provides itself.
    if (!proxy) {
      this.registerIntents(symbolicName, capabilities.map(capability => ({type: capability.type, qualifier: capability.qualifier})), true);
    }
  }

  /**
   * Registers intents of the given application.
   *
   * The parameter 'implicit' indicates the intents to be implicit because the application provides the capability itself.
   */
  public registerIntents(symbolicName: string, intents: Intent[], implicit: boolean = false): void {
    if (!intents || !intents.length) {
      return;
    }

    intents.forEach(it => {
      const intent: Intent = {
        ...it,
        metadata: {
          id: sha256(JSON.stringify({application: symbolicName, type: it.type, ...it.qualifier})).substr(0, 7), // use the first 7 digits of the intent hash as intent id
          symbolicAppName: symbolicName,
          implicit: implicit,
        }
      };

      this._intentsById.set(intent.metadata.id, intent);
      this._intentsByApplication.set(symbolicName, [
        ...(this._intentsByApplication.get(symbolicName) || []),
        intent,
      ]);
    });
  }

  /**
   * Disables capability scope check for given application.
   */
  public disableScopeChecks(symbolicName: string): void {
    this._scopeCheckDisabled.add(symbolicName);
  }

  /**
   * Returns whether or not capability scope check is disabled for given application.
   */
  public isScopeCheckDisabled(symbolicName: string): boolean {
    return this._scopeCheckDisabled.has(symbolicName);
  }
}
