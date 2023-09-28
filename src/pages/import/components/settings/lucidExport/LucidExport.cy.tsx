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
            cy.get('button').contains('Export').click().then(() => {
                expect(stubBoardGet).to.have.been.called;
            })
        });

        it('downloads a json file on click', () => {
            const stubSync = cy.stub();

            const itemOne: Partial<AppCard> = {
                id: '1',
                x: 1,
                y: 2,
                title: '[RETUS-1]',
                sync: stubSync,
            };
            const itemTwo: Partial<AppCard> = {
				id: '2',
				x: 2,
				y: 1,
				title: '[RETUS-2]',
				sync: stubSync,
			};
            cy.stub(miro.board, 'get').callsFake(() => {
				return Promise.resolve([itemOne, itemTwo]);
			});

            cy.mountWithStore(<LucidExport />);
            cy.get('button').contains('Export').click().then(() => {
                cy.wait(100);
                //file should be downloaded into cypress/downloads
                cy.readFile(
					`cypress/downloads/miro-export-${new Date()
						.toISOString()
						.substring(0, 10)}.json`
				).then((file) => {
					expect(file).to.deep.equal([
                        { id: itemOne.id, coordinates: { x: itemOne.x, y: itemOne.y } },
                        { id: itemTwo.id, coordinates: { x: itemTwo.x, y: itemTwo.y } },
                    ]);
				});
            });
        });
    })
});

