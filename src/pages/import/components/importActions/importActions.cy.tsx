import * as React from 'react';
import { AppCardToItemMapping } from '../../../../models/appCardToItemMapping.if';
import ImportActions from './ImportActions';

describe('<ImportActions>', () => {
	it('mounts', () => {
		cy.mount(
			<ImportActions
				selectedCount={0}
				totalCount={0}
				onImportSelected={() => {}}
				onImportAll={() => {}}
				onSync={() => {}}
				importedItems={[]}
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
					importedItems={[]}
				/>
			);

			cy.getBySel('importSelected').should(
				'have.text',
				'Import Selected (5)'
			);
		});

		it('disabled the "Import Selected" button when no items have been selected', () => {
			cy.mount(
				<ImportActions
					selectedCount={0}
					totalCount={0}
					onImportSelected={() => {}}
					onImportAll={() => {}}
					onSync={() => {}}
					importedItems={[]}
				/>
			);

			cy.getBySel('importSelected').should('be.disabled');
		});

		it('displays the passed amount of total Items in the "Import All" button', () => {
			cy.mount(
				<ImportActions
					selectedCount={0}
					totalCount={15}
					onImportSelected={() => {}}
					onImportAll={() => {}}
					onSync={() => {}}
					importedItems={[]}
				/>
			);

			cy.getBySel('importAll').should('have.text', 'Import all (15)');
		});

		it('calls the passed handler when clicking the "Import Selected" button', () => {
			const handler = cy.spy().as('handler');

			cy.mount(
				<ImportActions
					selectedCount={2}
					totalCount={5}
					onImportSelected={handler}
					onImportAll={() => {}}
					onSync={() => {}}
					importedItems={[]}
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
					importedItems={[]}
				/>
			);

			cy.getBySel('importAll').click();

			cy.get('@handler').should('have.been.calledOnce');
		});

		context('syncing', () => {
			it('displays the amount of already imported Items on the Sync button', () => {
				const items: AppCardToItemMapping[] = [
					{ itemId: '1', appCardId: '' },
					{ itemId: '2', appCardId: '' },
					{ itemId: '3', appCardId: '' },
				];

				cy.mount(
					<ImportActions
						selectedCount={0}
						totalCount={0}
						onImportSelected={() => {}}
						onImportAll={() => {}}
						onSync={() => {}}
						importedItems={items}
					/>
				);

				cy.getBySel('sync').should('contain.text', items.length);
			});

			it('calls the passed handler when clicking the "Sync" button', () => {
				const handler = cy.spy().as('handler');

				const items: AppCardToItemMapping[] = [
					{ itemId: '1', appCardId: '' },
					{ itemId: '2', appCardId: '' },
					{ itemId: '3', appCardId: '' },
				];

				cy.mount(
					<ImportActions
						selectedCount={0}
						totalCount={0}
						onImportSelected={() => {}}
						onImportAll={() => {}}
						onSync={handler}
						importedItems={items}
					/>
				);

				cy.getBySel('sync').click();

				cy.get('@handler').should('have.been.calledOnce');
			});
		});
	});
});
