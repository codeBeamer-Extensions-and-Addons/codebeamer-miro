import * as React from 'react';
import { IFilterCriteria } from '../../../../../models/filterCriteria.if';
import FilterCriteria from './FilterCriteria';

const testCriteria: IFilterCriteria = {
	id: 0,
	slug: 'Language',
	fieldName: 'Language',
	value: 'FR',
};

describe('<FilterCriteria>', () => {
	it('mounts', () => {
		cy.mountWithStore(
			<FilterCriteria filterCriteria={testCriteria} onRemove={() => {}} />
		);
	});

	it('displays given filter its slug');
	it('displays given filter its value');
	it('has a button to remove it with');
	it('calls the passed handler when the remove-button is clicked');
});
