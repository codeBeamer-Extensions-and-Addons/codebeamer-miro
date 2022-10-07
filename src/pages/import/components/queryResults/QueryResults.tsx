import { AppCard } from '@mirohq/websdk-types';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetItemsQuery } from '../../../../api/codeBeamerApi';
import { CARD_TITLE_ID_FILTER_REGEX } from '../../../../constants/cardTitleIdFilterRegex';
import {
	DEFAULT_ITEMS_PER_PAGE,
	DEFAULT_RESULT_PAGE,
} from '../../../../constants/cb-import-defaults';
import { AppCardToItemMapping } from '../../../../models/appCardToItemMapping.if';
import { ItemListView } from '../../../../models/itemListView';
import { ItemQueryResultView } from '../../../../models/itemQueryResultView';
import { displayAppMessage } from '../../../../store/slices/appMessagesSlice';
import { RootState } from '../../../../store/store';
import ImportActions from '../importActions/ImportActions';
import Importer from '../importer/Importer';
import QueryResult from '../queryResult/QueryResult';
import Updater from '../updater/Updater';

import './queryResults.css';

export default function QueryResults() {
	const dispatch = useDispatch();

	const [page, setPage] = useState(DEFAULT_RESULT_PAGE);
	const [items, setItems] = useState<ItemQueryResultView[]>([]);
	const [itemsToImport, setItemsToImport] = useState<string[]>([]);
	const [eos, setEos] = useState(false);
	const [importing, setImporting] = useState(false);
	const [synchronizing, setSynchronizing] = useState(false);

	const [importedItems, setImportedItems] = useState<AppCardToItemMapping[]>(
		[]
	);

	const intersectionObserverOptions = {
		root: document.getElementById('queryResultsContainer'),
		rootMargin: '0px',
		threshold: 1,
	};

	const intersectionObserverCallback = (
		entries: IntersectionObserverEntry[],
		observer: IntersectionObserver
	) => {
		if (!entries[0]) return;
		if (!entries[0].isIntersecting) return;
		observer.unobserve(entries[0].target);

		fetchItems();
	};

	const lazyLoadObserver: IntersectionObserver = new IntersectionObserver(
		intersectionObserverCallback,
		intersectionObserverOptions
	);

	const { cbqlString, trackerId, advancedSearch } = useSelector(
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
				const previous = page;
				setPage(previous + 1);
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
	 * Queries miro for the currently existing app_cards on the board.
	 * This does mean that this plugin is currently not 100% compatible with others that would create App Cards.
	 * TODO add an additional filter that filters for metadata, once available, to only get "our" cards
	 */
	React.useEffect(() => {
		miro.board.get({ type: 'app_card' }).then((existingCards) => {
			setImportedItems(
				existingCards.map((e) => {
					let card = e as AppCard;

					const itemKey = card.title.match(
						CARD_TITLE_ID_FILTER_REGEX
					);

					if (!itemKey?.length) {
						//TODO miro showErrorNotif
						console.error(
							"Couldn't extract ID from Card title. Can't sync!"
						);
						return { appCardId: card.id, itemId: '' };
					}
					const itemId = itemKey[1];

					return { appCardId: card.id, itemId: itemId };
				})
			);
		});
	}, []);

	/**
	 * Reset the items cache whenever we change filter or tracker
	 * Must run before the hook that adds the items from the newly fetched query
	 */
	React.useEffect(() => {
		setItems([]);
		setPage(1);
	}, [cbqlString]);

	React.useEffect(() => {
		lazyLoadObserver.disconnect();
	}, [trackerId]);

	//append loaded items whenever we get new ones
	//! this should (must, or else it doesn't really work) only trigger when we load another page of query results
	React.useEffect(() => {
		if (data && data.items.length) {
			if (data.page > 1) {
				setItems([
					...items,
					...data.items.map(
						(i: ItemListView) =>
							new ItemQueryResultView(i.id, i.name)
					),
				]);
			} else {
				setItems(
					data.items.map(
						(i: ItemListView) =>
							new ItemQueryResultView(i.id, i.name)
					)
				);
			}
		}
	}, [data]);

	React.useEffect(() => {
		const lastItem = document.querySelector(
			'#queryResults tbody tr:last-child'
		);
		if (lastItem) {
			lazyLoadObserver.observe(lastItem);
		}
	}, [items]);

	// React.useEffect(() => {
	// 	if (!error) return;
	// 	console.error(error);
	// 	let message = advancedSearch
	// 		? "Check your query's syntax for errors."
	// 		: 'Is your codebeamer server accessible?';
	// 	dispatch(
	// 		displayAppMessage({
	// 			header: 'Error querying Items',
	// 			content: (
	// 				<p>
	// 					{message}
	// 					<br />
	// 					<span className="muted text-dark">
	// 						Check console for details.
	// 					</span>
	// 				</p>
	// 			),
	// 			bg: 'danger',
	// 			delay: 5000,
	// 		})
	// 	);
	// }, [error]);

	const handleImportSelected = () => {
		setItemsToImport(
			items.filter((i) => i.selected).map((i) => i.id.toString())
		);
		setImporting(true);
	};

	const handleImportAll = () => {
		// passing an empty array == "Which one would you like to import? Yes."
		setItemsToImport([]);
		setImporting(true);
	};

	const handleSync = () => {
		setSynchronizing(true);
	};

	//just to debug with
	//TODO remove for release
	const closeModalDebugOnly = () => {
		setImporting(false);
	};

	//*********************************************************************** */
	//********************************RENDER********************************* */
	//*********************************************************************** */

	if (!items.length && isLoading) {
		return (
			<div className="centered h-auto">
				<div className="loading-spinner"></div>
			</div>
		);
	}
	if (data && data.total == 0) {
		return (
			<div className="centered h-auto">
				<h3 className="h3 muted-info" data-test="noItemsInTracker">
					No Items in this Query
				</h3>
			</div>
		);
	} else if (error) {
		return (
			<div className="centered h-auto">
				<h3 className="h3 error">Invalid query</h3>
			</div>
		);
	} else if (trackerId) {
		return (
			<div>
				<table
					className="table"
					id="queryResults"
					data-test="resultsTable"
				>
					<thead>
						<tr>
							<td>Imported</td>
							<td>ID</td>
							<td>Name</td>
						</tr>
					</thead>
					<tbody data-test="tableBody">
						{items.map((i) => (
							<QueryResult
								item={i}
								key={i.id}
								checked={
									importedItems.find(
										(imported) => imported.itemId == i.id
									) !== undefined
								}
								disabled={
									importedItems.find(
										(imported) => imported.itemId == i.id
									) !== undefined
								}
								onSelect={toggleItemSelected}
							/>
						))}
					</tbody>
					<tfoot>
						<tr className="text-center">
							{!eos && (
								<td
									colSpan={3}
									className="position-relative loading-spinner loading-spinner-table-end"
								></td>
							)}
							{eos && (
								<td
									colSpan={3}
									className="muted"
									data-test="eosInfo"
								>
									End of stream
								</td>
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
					importedItems={importedItems}
				/>
				{importing && (
					<Importer
						items={itemsToImport}
						totalItems={
							itemsToImport.length > 0
								? itemsToImport.length
								: data?.total
						}
						onClose={closeModalDebugOnly}
					/>
				)}
				{synchronizing && <Updater items={importedItems} />}
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
