import * as React from 'react';
import { ItemListView } from '../../../../models/itemListView';
import QueryResult from './QueryResult';

describe('<QueryResult>', () => {
	it('mounts', () => {
		const item: ItemListView = { id: '1', name: 'Testitem' };
		cy.mount(<QueryResult item={item} onSelect={() => {}} />);
	});

	context('displayvalues', () => {
		const itemId = 1;
		const itemName = 'TestItem';

		beforeEach(() => {
			const item: ItemListView = { id: itemId, name: itemName };
			cy.mount(<QueryResult item={item} onSelect={() => {}} />);
		});

		it('displays the Item its id', () => {
			cy.getBySel('itemId').should('have.text', itemId);
		});

		it('displays the Item its name', () => {
			cy.getBySel('itemName').should('have.text', itemName);
		});
	});

	it('calls the function given as prop when its checkbox is clicked', () => {
		const item: ItemListView = { id: '1', name: 'Testitem' };
		const callbackSpy = cy.spy().as('clickHandlerSpy');

		cy.mount(<QueryResult item={item} onSelect={callbackSpy} />);

		cy.getBySel('itemCheck-' + item.id).click();

		cy.get('@clickHandlerSpy').should('have.been.calledWith', item, true);
	});

	afterEach(() => {
		localStorage.clear();
		sessionStorage.clear();
	});
});
