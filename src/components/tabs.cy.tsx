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
	});

	it('defaults to the provided initiallySelectedIndex its respective tab content when provided', () => {
		const expectedContent = '2';
		cy.mountWithStore(<Tabs tabs={tabs} initiallySelectedIndex={1} />);

		cy.getBySel(tabContentSelector).should('contain.text', expectedContent);
	});

	it('displays the content of tab x when selecting it', () => {
		const expectedContent = '3';
		cy.mountWithStore(<Tabs tabs={tabs} />);

		//* x is simply the last one in this example.
		cy.get('.tab')
			.last()
			.click()
			.then(() => {
				cy.getBySel('tab-content').should(
					'contain.text',
					expectedContent
				);
			});
	});

	it('sets only the clicked tab-header to "active"', () => {
		const activeClass = 'tab-active';
		const tabHeader = tabs[2].title;
		cy.mountWithStore(<Tabs tabs={tabs} />);

		//* using the last header as example
		//* note that we implicitly test that only one element has the class by chaining .should() off of the filtered
		//* result of .get(). If the filter returned more than one elements, cypress would complain with an error.
		cy.get('.tab')
			.last()
			.click()
			.then(() => {
				cy.get('.tab')
					.filter((i, t) => t.classList.contains(activeClass))
					.should('contain.text', tabHeader);
			});
	});
});
