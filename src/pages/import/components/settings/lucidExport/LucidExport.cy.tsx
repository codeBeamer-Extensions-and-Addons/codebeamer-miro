import { AppCard } from '@mirohq/websdk-types';
import React from 'react';
import LucidExport from './LucidExport';

describe('<LucidExport', () => {
	it('mounts', () => {
		cy.mountWithStore(<LucidExport />);
	});

    it('has a button to load all items on the board', () => {
        cy.mountWithStore(<LucidExport />);
        cy.get('button').contains('Export');
    });

    describe('button logic', () => {
        it('loads all items on the board on click', () => {
            const stubSync = cy.stub();

            const itemOne: Partial<AppCard> = {
				id: '1',
				title: '[RETUS-1]',
				sync: stubSync,
			};
			const itemTwo: Partial<AppCard> = {
				id: '2',
				title: '[RETUS-2]',
				sync: stubSync,
			};

            const stubBoardGet = cy.stub(miro.board, 'get').callsFake(() => {
				return Promise.resolve([itemOne, itemTwo]);
			});

            cy.mountWithStore(<LucidExport />);
            cy.get('button').contains('Generate').click().then(() => {
                expect(stubBoardGet).to.have.been.called;
            })
        });
    })
});

