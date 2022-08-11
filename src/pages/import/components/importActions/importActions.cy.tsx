import * as React from 'react';
import ImportActions from './importActions';

describe('<ImportActions>', () => {
	it('mounts', () => {
		cy.mount(
			<ImportActions
				selectedCount={0}
				totalCount={0}
				onImportSelected={() => {}}
				onImportAll={() => {}}
				onSync={() => {}}
			/>
		);
	});

	context('props', () => {
		it('displays the passed amount of selectedItems in the "Import Selected" button', () => {
			cy.mount(
				<ImportActions
					selectedCount={5}
					totalCount={0}
					onImportSelected={() => {}}
					onImportAll={() => {}}
					onSync={() => {}}
				/>
			);

			cy.getBySel('importSelected').should(
				'have.text',
				'Import Selected (5)'
			);
		});

		it('displays the passed amount of total Items in the "Import All" button', () => {
			cy.mount(
				<ImportActions
					selectedCount={0}
					totalCount={15}
					onImportSelected={() => {}}
					onImportAll={() => {}}
					onSync={() => {}}
				/>
			);

			cy.getBySel('importAll').should('have.text', 'Import all (15)');
		});

		//TODO then
		it.skip(
			'displays the amount of already imported Items on the Sync button'
		);

		it('calls the passed handler when clicking the "Import Selected" button', () => {
			const handler = cy.spy().as('handler');

			cy.mount(
				<ImportActions
					selectedCount={0}
					totalCount={0}
					onImportSelected={handler}
					onImportAll={() => {}}
					onSync={() => {}}
				/>
			);

			cy.getBySel('importSelected').click();

			cy.get('@handler').should('have.been.calledOnce');
		});

		it('calls the passed handler when clicking the "Import All" button', () => {
			const handler = cy.spy().as('handler');

			cy.mount(
				<ImportActions
					selectedCount={0}
					totalCount={0}
					onImportSelected={() => {}}
					onImportAll={handler}
					onSync={() => {}}
				/>
			);

			cy.getBySel('importAll').click();

			cy.get('@handler').should('have.been.calledOnce');
		});

		it.skip('calls the passed handler when clicking the "Sync" button', () => {
			const handler = cy.spy().as('handler');

			cy.mount(
				<ImportActions
					selectedCount={0}
					totalCount={0}
					onImportSelected={() => {}}
					onImportAll={() => {}}
					onSync={handler}
				/>
			);

			//TODO stub amount of synched Items

			cy.getBySel('sync').click();

			cy.get('@handler').should('have.been.calledOnce');
		});
	});
});
