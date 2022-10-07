// ***********************************************************
// This example support/component.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

import { mount } from 'cypress/react18';
import { MountOptions, MountReturn } from 'cypress/react';
import * as React from 'react';

import { getStore, RootState } from '../../src/store/store';
import { Provider } from 'react-redux';
import { EnhancedStore } from '@reduxjs/toolkit';

// Augment the Cypress namespace to include type definitions for
// your custom command.
// Alternatively, can be defined in cypress/support/component.d.ts
// with a <reference path="./component" /> at the top of your spec.
declare global {
	namespace Cypress {
		interface Chainable {
			mount: typeof mount;
			getBySel(
				selector: string,
				...args: any
			): Chainable<JQuery<Element>>;
			mountWithStore(
				component: React.ReactNode,
				options?: MountOptions & {
					reduxStore?: EnhancedStore<RootState>;
				}
			): Chainable<MountReturn>;
		}
	}
}

Cypress.Commands.add('mount', mount);

Cypress.Commands.add('mountWithStore', (component, options = {}) => {
	const { reduxStore = getStore(), ...mountOptions } = options;

	const wrapped = <Provider store={reduxStore}>{component}</Provider>;

	return mount(wrapped, mountOptions);
});

Cypress.Commands.add('getBySel', (selector, ...args) => {
	return cy.get(`[data-test=${selector}]`, ...args);
});
