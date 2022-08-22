import * as React from 'react';
import Tabs, { ITab } from './Tabs';

const tabs: ITab[] = [
	{
		title: 'Test1',
		tab: <div>1</div>,
	},
	{
		title: 'Test2',
		tab: <div>2</div>,
	},
	{
		title: 'Test3',
		tab: <div>3</div>,
	},
];

const tabContentSelector = 'tab-content';

describe('<Tabs>', () => {
	it('mounts', () => {
		cy.mountWithStore(<Tabs tabs={tabs} />);
	});

	it('defaults to the tab with index 0', () => {
		const expectedContent = '1';
		cy.mountWithStore(<Tabs tabs={tabs} />);

		cy.getBySel(tabContentSelector).should('contain.text', expectedContent);
		//! clearly there, but not for the test
	});

	it('defaults to the provided initiallySelectedIndex its respective tab content when provided', () => {
		const expectedContent = '2';
		cy.mountWithStore(<Tabs tabs={tabs} initiallySelectedIndex={1} />);

		cy.getBySel(tabContentSelector).should('contain.text', expectedContent);
		//! clearly there, but not for the test
	});
});
