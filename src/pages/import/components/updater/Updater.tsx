import React, { useState } from 'react';
import { Modal, Spinner, ProgressBar } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import {
	useGetItemsQuery,
	useGetTrackerDetailsQuery,
} from '../../../../api/codeBeamerApi';
import { updateAppCard } from '../../../../api/miro.api';
import {
	DEFAULT_RESULT_PAGE,
	MAX_ITEMS_PER_IMPORT,
} from '../../../../constants/cb-import-defaults';
import { AppCardToItemMapping } from '../../../../models/appCardToItemMapping.if';
import { CodeBeamerItem } from '../../../../models/codebeamer-item.if';
import { RootState } from '../../../../store/store';

import '../importer/importer.css';

/**
 * Twin of {@link Importer}, but for updating.
 */
export default function Updater(props: {
	items: AppCardToItemMapping[];
	onClose?: Function;
}) {
	// My programming skills were insufficient to adequately generalize Importer & Updater. They only differ in a few (but supposedly essential) cases.
	// So I fell back to creating a seperate one for the Updater, with much duplication. If you know better, please go ahead.

	const dispatch = useDispatch();

	const { trackerId } = useSelector((state: RootState) => state.userSettings);

	const [loaded, setLoaded] = useState(0);

	//* applies all currently active filters by using the stored cbqlString,
	//* then further filters out only the selected items (or takes all of 'em)
	//? maybe fetching every item on its own is more efficient. cb takes a long time to resolve that 'item.id IN' query.
	const { data, error, isLoading } = useGetItemsQuery({
		page: DEFAULT_RESULT_PAGE,
		pageSize: MAX_ITEMS_PER_IMPORT,
		queryString: `item.id IN (${props.items
			.map((i) => i.itemId)
			.join(',')})`,
	});

	const {
		key,
		color,
		error: trackerDetailsQueryError,
		isLoading: isTrackerDetailsQueryLoading,
	} = useGetTrackerDetailsQuery(trackerId, {
		selectFromResult: ({ data, error, isLoading }) => ({
			key: data?.keyName,
			color: data?.color,
			error: error,
			isLoading: isLoading,
		}),
	});

	React.useEffect(() => {
		const syncItems = async (items: CodeBeamerItem[]) => {
			const _items: CodeBeamerItem[] = structuredClone(items);
			for (let i = 0; i < _items.length; i++) {
				if (_items[i].categories?.length) {
					if (
						_items[i].categories.find(
							(c) => c.name == 'Folder' || c.name == 'Information'
						)
					) {
						miro.board.notifications.showInfo(
							`${_items[i].name} is a Folder / Information and will not be imported.`
						);
						continue;
					}
				}
				_items[i].tracker.keyName = key;
				_items[i].tracker.color = color;

				const appCardId = props.items.find(
					(item) => item.itemId == _items[i].id.toString()
				)?.appCardId;
				if (!appCardId) {
					miro.board.notifications.showError(
						`Failed updating card for Item ${_items[i].name}`
					);
					continue;
				}

				await updateAppCard(_items[i], appCardId);
				setLoaded(i + 1);
			}
			await miro.board.ui.closeModal();
		};

		if (error || trackerDetailsQueryError) {
			//error is logged by rtk handler
		} else if (data && key) {
			syncItems(data.items as CodeBeamerItem[]).catch((err) =>
				console.error(err)
			);
		}
	}, [data, key]);

	return (
		<Modal show centered>
			<Modal.Header
				closeButton={props.onClose !== undefined}
				onHide={() => {
					if (props.onClose) props.onClose();
				}}
			></Modal.Header>
			<Modal.Body>
				<div className="centered w-80">
					<h5 className="h5 text-center">
						<Spinner animation="grow" variant="primary" />
						<br />
						{isLoading && <span>Fetching data</span>}
						{!isLoading && <span>Syncing cards</span>}
					</h5>
					<ProgressBar
						className="w-100"
						variant="primary"
						now={loaded}
						max={props.items.length}
						label={`${loaded}/${props.items.length}`}
						data-test="importProgress"
					/>
				</div>
			</Modal.Body>
		</Modal>
	);
}
