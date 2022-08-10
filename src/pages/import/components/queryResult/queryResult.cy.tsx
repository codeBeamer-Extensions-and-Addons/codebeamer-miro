import { ItemListView } from '../../../../models/itemListView';
import QueryResult from './QueryResult';

describe('<QueryResult>', () => {
	it('mounts', () => {
		const item: ItemListView = { id: '1', name: 'Testitem' };
		cy.mount(<QueryResult item={item} onSelect={() => {}} />);
	});

	//TODO

	afterEach(() => {
		localStorage.clear();
		sessionStorage.clear();
	});
});
