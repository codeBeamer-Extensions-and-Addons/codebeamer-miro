import * as React from 'react';
import { setTrackerId } from '../../../../store/slices/userSettingsSlice';
import { getStore } from '../../../../store/store';
import Importer from './Importer';

describe('<Importer>', () => {
	it('mounts', () => {
		cy.mountWithStore(<Importer items={[]} />);
	});

	it('does not show a close button by default', () => {
		cy.mountWithStore(<Importer items={[]} />);

		cy.get('[aria-label="close"]').should('not.exist');
	});

	it('does show a close button if passed an onClose prop', () => {
		const handler = cy.spy();
		cy.mountWithStore(<Importer items={[]} onClose={handler} />);

		cy.get('[aria-label="Close"]').should('exist');
	});

	it('calls the passed onClose handler when the close button is clicked', () => {
		const handler = cy.spy().as('handler');
		cy.mountWithStore(<Importer items={[]} onClose={handler} />);

		cy.get('[aria-label="Close"]').click();

		cy.get('@handler').should('have.been.calledOnce');
	});

	it('fetches the details of the items passed as props', () => {
		const items: string[] = ['1', '2', '3'];
		const store = getStore();
		store.dispatch(setTrackerId('1'));

		const expectedQuery = `tracker.id IN (1) AND item.id IN (1,2,3)`;

		cy.intercept('POST', '**/api/v3/items/query').as('fetch');

		cy.mountWithStore(<Importer items={items} />, { reduxStore: store });

		cy.wait('@fetch')
			.its('request.body.queryString')
			.should('equal', expectedQuery);
	});

	it('fetches the tracker details of the items passed as props', () => {
		const items: string[] = ['1', '2', '3', '4'];
		const store = getStore();

		cy.stub(miro.board, 'createAppCard').resolves(null);
		cy.stub(miro.board.viewport, 'get').resolves({
			x: 0,
			y: 0,
			width: 1000,
			height: 1000,
		});

		cy.intercept('POST', '**/wiki2html');

		cy.intercept('POST', '**/api/v3/items/query', {
			fixture: 'query_diff_trackers.json',
		}).as('fetch');

		cy.intercept('GET', '**/api/v3/trackers/101').as('trackerFetchOne');
		cy.intercept('GET', '**/api/v3/trackers/102').as('trackerFetchTwo');
		cy.intercept('GET', '**/api/v3/trackers/103').as('trackerFetchThree');
		cy.intercept('GET', '**/api/v3/trackers/104').as('trackerFetchFour');

		cy.mountWithStore(<Importer items={items} />, { reduxStore: store });

		cy.wait('@fetch');

		cy.wait('@trackerFetchOne').then((interception) => {
			expect(interception.request.url).to.contain('trackers/101');
		});

		cy.wait('@trackerFetchTwo').then((interception) => {
			expect(interception.request.url).to.contain('trackers/102');
		});

		cy.wait('@trackerFetchThree').then((interception) => {
			expect(interception.request.url).to.contain('trackers/103');
		});

		cy.wait('@trackerFetchFour').then((interception) => {
			expect(interception.request.url).to.contain('trackers/104');
		});
	});

	it('fetches the details of all items in the selected tracker (without any additional filter criteria) when passing an empty array as prop', () => {
		const items: string[] = [];
		const store = getStore();
		store.dispatch(setTrackerId('1'));

		const expectedQuery = `tracker.id IN (1)`;

		cy.intercept('POST', '**/api/v3/items/query').as('fetch');

		cy.mountWithStore(<Importer items={items} />, { reduxStore: store });

		cy.wait('@fetch')
			.its('request.body.queryString')
			.should('equal', expectedQuery);
	});

	it('appends what items are already imported to the queryString so as not to duplicate them', () => {
		cy.stub(miro.board, 'get')
			.as('boardGetStub')
			.withArgs({ type: 'app_card' })
			.resolves(mockImportedItems);

		const items: string[] = ['1', '2', '3'];
		const store = getStore();
		store.dispatch(setTrackerId('1'));

		const expectedQuery = `tracker.id IN (1) AND item.id IN (${items.join(
			','
		)}) AND item.id NOT IN (569657,569527)`; //the latter two are from down in the mockImportedItems

		cy.intercept('POST', '**/api/v3/items/query', {
			statusCode: 200,
			body: [],
		}).as('fetch');

		cy.mountWithStore(<Importer items={items} />, { reduxStore: store });

		cy.get('@boardGetStub').should('be.called');

		//that's just React, or my inability to properly use it - one call will be made to @fetch before the importedItems
		//are updated. once they are, an overriding second call is made, which is the final one we want
		cy.wait('@fetch');

		cy.wait('@fetch')
			.its('request.body.queryString')
			.should('equal', expectedQuery);
	});

	context('prop queryString', () => {
		it('fetches the details of the items specified in the queryString if one is specified', () => {
			const mockQueryString = 'item.id IN (1,2,3,4)';
			cy.intercept('POST', '**/api/v3/items/query').as('fetch');

			cy.mountWithStore(
				<Importer items={[]} queryString={mockQueryString} />
			);

			cy.wait('@fetch')
				.its('request.body.queryString')
				.should('equal', mockQueryString);
		});

		it('still appends what items are already imported to the queryString so as not to duplicate them', () => {
			cy.stub(miro.board, 'get')
				.as('boardGetStub')
				.withArgs({ type: 'app_card' })
				.resolves(mockImportedItems);

			const mockQueryString = 'item.id IN (1,2,3,4)';

			const expectedQuery = `${mockQueryString} AND item.id NOT IN (569657,569527)`; //the latter two are from down in the mockImportedItems

			cy.intercept('POST', '**/api/v3/items/query', {
				statusCode: 200,
				body: [],
			}).as('fetch');

			cy.mountWithStore(
				<Importer items={[]} queryString={mockQueryString} />
			);

			cy.get('@boardGetStub').should('be.called');

			//that's just React, or my inability to properly use it - one call will be made to @fetch before the importedItems
			//are updated. once they are, an overriding second call is made, which is the final one we want
			cy.wait('@fetch');

			cy.wait('@fetch')
				.its('request.body.queryString')
				.should('equal', expectedQuery);
		});
	});

	describe('import progress bar', () => {
		const progressBarSelector = 'importProgress';

		it('shows the total amount of items to import based on the passed items array', () => {
			const items: string[] = ['1', '2', '3'];
			cy.intercept('POST', '**/api/v3/items/query').as('fetch');

			cy.mountWithStore(<Importer items={items} />);

			cy.getBySel(progressBarSelector).should(
				'contain.text',
				`/${items.length}`
			);
		});

		/**
		 * Because importing all is communicated with an empty array, its length doesn't serve as measure in this case
		 */
		it('shows the total amount of items to import based on a fallback value when importing all items for a query', () => {
			const items: string[] = [];
			const totalItems = 235;
			cy.intercept('POST', '**/api/v3/items/query').as('fetch');

			cy.mountWithStore(
				<Importer items={items} totalItems={totalItems} />
			);

			cy.getBySel(progressBarSelector).should(
				'contain.text',
				`/${totalItems}`
			);
		});
	});
});

const mockImportedItems = [
	{
		type: 'app_card',
		owned: true,
		title: '<a href="https://codebeamer.com/cb/issue/569657">Do a barrel roll - [PBI|569657]</a>',
		description: 'hi',
		style: {
			cardTheme: '#ffab46',
		},
		tagIds: [],
		status: 'disconnected',
		fields: [
			{
				value: 'ID: 569657',
				fillColor: '#bf4040',
				textColor: '#ffffff',
			},
			{
				value: 'Owner: me',
				fillColor: '#4095bf',
				textColor: '#ffffff',
			},
		],
		id: '1284604263',
		parentId: null,
		origin: 'center',
		createdAt: '2022-10-27T10:51:32.088Z',
		createdBy: '3074457359559759394',
		modifiedAt: '2022-12-20T06:07:16.741Z',
		modifiedBy: '3074457359559759394',
		x: -980.3690303296571,
		y: 2873.21422855878,
		width: 320,
		height: 190,
		rotation: 0,
	},
	{
		type: 'app_card',
		owned: true,
		title: '<a href="https://codebeamer.com/cb/issue/569527">Improve your barrel roll - [PBI|569527]</a>',
		description: 'hello from the other side',
		style: {
			cardTheme: '#ffab46',
		},
		tagIds: [],
		status: 'connected',
		fields: [
			{
				value: 'ID: 569527',
				fillColor: '#bf4040',
				textColor: '#ffffff',
			},
			{
				value: 'Teams: Unicorns',
				fillColor: '#40bf95',
				textColor: '#ffffff',
			},
		],
		id: '869124682946',
		parentId: null,
		origin: 'center',
		createdAt: '2022-10-27T10:51:32.321Z',
		createdBy: '3074457359559759394',
		modifiedAt: '2022-12-13T05:17:02.615Z',
		modifiedBy: '3074457359559759394',
		x: -1398.39803840151,
		y: 2724.40598150612,
		width: 396.6044358451181,
		height: 190.00000000000023,
		rotation: 0,
	},
];
