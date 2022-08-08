import { ItemListView } from './itemListView';

export interface ItemQueryPage {
	page: number;
	pageSize: number;
	total: number;
	items: ItemListView[];
}
