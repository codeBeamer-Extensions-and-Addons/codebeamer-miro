import * as React from 'react';
import { getStore } from '../../store/store';
import Toasts from './Toasts';
import {
	AppMessage,
	displayAppMessage,
} from '../../store/slices/appMessagesSlice';

const messages: AppMessage[] = [
	{
		id: 0,
		header: '<h3>Hello there</h3>',
		content: '<p>Nothing to see here.</p>',
		bg: 'light',
	},
	{
		id: 1,
		header: '<h3>Hello there <small>again</small></h3>',
		content: '<p>Still nothing to see here.</p>',
		bg: 'info',
	},
	{
		id: 2,
		header: '<h3>Hello there <small>again again</small></h3>',
		content: '<p>No content in here.</p>',
		bg: 'warning',
	},
];

const param1 = 'Param One';
const param2 = 2;
const param3 = Math.floor(3.5);

const parametrizedMessages: AppMessage[] = [
	{
		id: 0,
		header: '<h3>Hello there</h3>',
		content: `<p>${param1} to see here.</p>`,
		bg: 'light',
	},
	{
		id: 1,
		header: '<h3>Hello there <small>again</small></h3>',
		content: `<p>${param2} to see here.</p>`,
		bg: 'info',
	},
	{
		id: 2,
		header: '<h3>Hello there <small>again again</small></h3>',
		content: `<p>${param3} in here.</p>`,
		bg: 'warning',
	},
];

describe('<Toasts>', () => {
	it('mounts', () => {
		cy.mountWithStore(<Toasts />);
	});

	it('displays toasts for the messages in store', () => {
		const store = getStore();
		for (let message of messages) {
			store.dispatch(displayAppMessage(message));
		}

		cy.mountWithStore(<Toasts />, { reduxStore: store });

		for (let i = 0; i < messages.length; i++) {
			cy.getBySel(`toast-${i}`)
				.should('exist')
				.and('contain.text', messages[i].content);
		}
	});

	it('displays toasts for the messages in store containing parametrized values', () => {
		const store = getStore();
		for (let message of parametrizedMessages) {
			store.dispatch(displayAppMessage(message));
		}

		cy.mountWithStore(<Toasts />, { reduxStore: store });

		for (let i = 0; i < parametrizedMessages.length; i++) {
			cy.getBySel(`toast-${i}`)
				.should('exist')
				.and('contain.text', parametrizedMessages[i].content);
		}
	});

	it('displays a toast for a message in store containing jsx', () => {
		const jsxParamZero = 'mate';
		const jsxParamOne = 'A JSX Param';

		const expectedHeader = `Hello there ${jsxParamZero}`;
		const expectedContent = `${jsxParamOne} to see here.`;

		const jsxMessage: AppMessage = {
			id: 0,
			header: <h3>Hello there {jsxParamZero}</h3>,
			content: <p>{jsxParamOne} to see here.</p>,
			bg: 'light',
		};

		const store = getStore();
		store.dispatch(displayAppMessage(jsxMessage));

		cy.mountWithStore(<Toasts />, { reduxStore: store });
		cy.getBySel(`toast-${0}`)
			.should('exist')
			.and('contain.text', expectedContent)
			.and('contain.text', expectedHeader);
	});

	it('displays a toast for a message added to the store', () => {
		const store = getStore();
		const index = 0;

		cy.mountWithStore(<Toasts />, { reduxStore: store });

		store.dispatch(displayAppMessage(messages[index]));

		cy.getBySel(`toast-${index}`)
			.should('exist')
			.and('contain.text', messages[index].content);
	});

	it('displays toasts with their defined background color', () => {
		const store = getStore();
		for (let message of messages) {
			store.dispatch(displayAppMessage(message));
		}

		cy.mountWithStore(<Toasts />, { reduxStore: store });

		for (let i = 0; i < messages.length; i++) {
			cy.getBySel(`toast-${i}`)
				.should('exist')
				.and('have.class', `bg-${messages[i].bg}`);
		}
	});

	it('removes a toast after given delay', () => {
		const delay = 100;
		messages[0].delay = delay;

		const store = getStore();

		cy.mountWithStore(<Toasts />, { reduxStore: store });
		store.dispatch(displayAppMessage(messages[0]));

		cy.wait(delay + 10);

		cy.getBySel(`toast-${0}`).should('not.exist');
	});

	it('removes a toast when its close button is clicked', () => {
		const store = getStore();
		store.dispatch(displayAppMessage(messages[0]));

		cy.mountWithStore(<Toasts />, { reduxStore: store });

		cy.getBySel(`toast-${0}`)
			.find('.btn-close')
			.click()
			.then(() => {
				cy.getBySel(`toast-${0}`).should('not.exist');
			});
	});
});
