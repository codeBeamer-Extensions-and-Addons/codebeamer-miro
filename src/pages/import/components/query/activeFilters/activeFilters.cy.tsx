import * as React from 'react';
import { IFilterCriteria } from '../../../../../models/filterCriteria.if';
import ActiveFilters from './ActiveFilters';

const testCriteria: IFilterCriteria[] = [
	{
		id: 0,
		slug: 'Language',
		fieldName: 'Language',
		value: 'FR',
	},
	{
		id: 0,
		slug: 'Place',
		fieldName: 'place',
		value: 'Avignon',
	},
	{
		id: 0,
		slug: 'Owner',
		fieldName: 'owner',
		value: 'Aurelieng',
	},
];

describe('<ActiveFilters>', () => {
	it('mounts', () => {
		cy.mountWithStore(<ActiveFilters />);
	});

	it('displays a FilterCriteria component for each filterCriteria in store');
	it(
		'removes a filter criteria from store when its component its remove-button is clicked'
	);
});
