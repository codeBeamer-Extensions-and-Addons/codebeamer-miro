import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useGetItemsQuery } from '../../../../api/codeBeamerApi';
import {
	DEFAULT_ITEMS_PER_PAGE,
	DEFAULT_RESULT_PAGE,
} from '../../../../constants/cb-import-defaults';
import { ItemListView } from '../../../../models/itemListView';
import { ItemQueryResultView } from '../../../../models/itemQueryResultView';
import { RootState } from '../../../../store/store';
import ImportActions from '../importActions/ImportActions';
import Importer from '../importer/importer';
import QueryResult from '../queryResult/QueryResult';

import './queryResults.css';

export default function QueryResults() {
	const [page, setPage] = useState(DEFAULT_RESULT_PAGE);
	const [items, setItems] = useState<ItemQueryResultView[]>([]);
	const [itemsToImport, setItemsToImport] = useState<string[]>([]);
	const [eos, setEos] = useState(false);
	const [importing, setImporting] = useState(false);

	let lazyLoadObserver: IntersectionObserver;

	const { cbqlString, trackerId } = useSelector(
		(state: RootState) => state.userSettings
	);

	const { data, error, isLoading } = useGetItemsQuery({
		page: page,
		pageSize: DEFAULT_ITEMS_PER_PAGE,
		queryString: cbqlString,
	});

	/**
	 * Fetches items indirectly by increasing the observed {@link page} variable.
	 * Also updates {@link eos}, terminating fetches when it's reached.
	 */
	const fetchItems = () => {
		if (data) {
			setEos(items.length >= data.total);
			if (items.length < data.total) {
				setPage(page + 1);
			}
		}
	};

	/**
	 * Handler for (un-)checking an item.
	 * @param item Item in question
	 * @param checked Value to set the Item's "selected" property to (== its checkbox' "checked" value)
	 */
	const toggleItemSelected = (
		item: ItemQueryResultView,
		checked: boolean
	) => {
		setItems(
			items.map((i) => {
				if (i.id != item.id) return i;
				return new ItemQueryResultView(item.id, item.name, checked);
			})
		);
	};

	/**
	 * Reset the items cache whenever we change filter or tracker
	 * Must run before the hook that adds the items from the newly fetched query
	 */
	React.useEffect(() => {
		setItems([]);
	}, [cbqlString]);

	//append loaded items whenever we get new ones
	//! this should (must, or else it doesn't really work) only trigger when we load another page of query results
	React.useEffect(() => {
		if (data && data.items.length) {
			setItems([
				...items,
				...data.items.map(
					(i: ItemListView) => new ItemQueryResultView(i.id, i.name)
				),
			]);
		}
	}, [data]);

	React.useEffect(() => {
		console.error(error);
		//TODO miro.showErrorNotif
	}, [error]);

	React.useEffect(() => {
		//TODO get working
		const options = {
			root: document.getElementById('queryResults'),
			rootMargin: '0px',
			threshold: 1,
		};

		const callback = (
			entries: IntersectionObserverEntry[],
			observer: IntersectionObserver
		) => {
			if (!entries[0]) return;
			if (!entries[0].isIntersecting) return;
			observer.unobserve(entries[0].target);

			fetchItems();
		};

		lazyLoadObserver = new IntersectionObserver(callback, options);
	}, []);

	const handleImportSelected = () => {
		console.log('handle import selected');
		setItemsToImport(
			items.filter((i) => i.selected).map((i) => i.id.toString())
		);
		setImporting(true);
	};

	const handleImportAll = () => {
		console.log('handle import all');
		setItemsToImport(items.map((i) => i.id.toString()));
		setImporting(true);
	};

	const handleSync = () => {
		console.log('handle sync');
		setImporting(true);
	};

	//just to debug with
	const closeModalDebugOnly = () => {
		setImporting(false);
	};

	//*********************************************************************** */
	//********************************RENDER********************************* */
	//*********************************************************************** */

	if (data && data.total == 0) {
		return (
			<div className="centered">
				<h3 className="h3 muted-info" data-test="noItemsInTracker">
					No Items in this Tracker
				</h3>
			</div>
		);
	} else if (error) {
		//TODO only for CBQL input I think
		return (
			<div className="centered">
				<h3 className="h3 error">Invalid query</h3>
			</div>
		);
	} else if (trackerId) {
		return (
			<div>
				<table className="table" id="queryResults">
					<thead>
						<tr>
							<td>Imported</td>
							<td>ID</td>
							<td>Name</td>
						</tr>
					</thead>
					<tbody>
						{items.map((i) => (
							<QueryResult
								item={i}
								key={i.id}
								onSelect={toggleItemSelected}
							/>
						))}
					</tbody>
					<tfoot>
						<tr className="text-center">
							{eos && (
								<span className="muted">End of stream</span>
							)}
						</tr>
					</tfoot>
				</table>
				<ImportActions
					selectedCount={items.filter((i) => i.selected).length}
					totalCount={data?.total ?? 0}
					onImportSelected={handleImportSelected}
					onImportAll={handleImportAll}
					onSync={handleSync}
				/>
				{importing && (
					<Importer
						items={itemsToImport}
						onClose={closeModalDebugOnly}
					/>
				)}
			</div>
		);
	} else {
		return (
			<div className="centered">
				<h3 className="h3 muted-color">
					Select a Tracker to load its Items
				</h3>
			</div>
		);
	}
}
