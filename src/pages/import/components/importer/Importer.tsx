import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Spinner from 'react-bootstrap/Spinner';
import { useDispatch, useSelector } from 'react-redux';
import {
	useGetItemsQuery,
	useGetTrackerDetailsQuery,
} from '../../../../api/codeBeamerApi';
import { createAppCard } from '../../../../api/miro.api';
import {
	DEFAULT_RESULT_PAGE,
	MAX_ITEMS_PER_IMPORT,
} from '../../../../constants/cb-import-defaults';
import { CodeBeamerItem } from '../../../../models/codebeamer-item.if';
import { displayAppMessage } from '../../../../store/slices/appMessagesSlice';
import { RootState } from '../../../../store/store';

import './importer.css';

export default function Importer(props: {
	items: string[];
	totalItems?: number;
	onClose?: Function;
}) {
	const dispatch = useDispatch();

	const { trackerId, cbqlString } = useSelector(
		(state: RootState) => state.userSettings
	);

	const [loaded, setLoaded] = useState(0);

	//* applies all currently active filters by using the stored cbqlString,
	//* then further filters out only the selected items (or takes all of 'em)
	const { data, error, isLoading } = useGetItemsQuery({
		page: DEFAULT_RESULT_PAGE,
		pageSize: MAX_ITEMS_PER_IMPORT,
		queryString: `${cbqlString}${
			props.items.length
				? ' AND item.id IN (' + props.items.join(',') + ')'
				: ''
		}`,
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
		const importItems = async (items: CodeBeamerItem[]) => {
			const _items: CodeBeamerItem[] = structuredClone(items);
			for (let i = 0; i < _items.length; i++) {
				if (_items[i].categories?.length) {
					if (
						_items[i].categories.find(
							(c) => c.name == 'Folder' || c.name == 'Information'
						)
					) {
						dispatch(
							displayAppMessage({
								header: 'Skipping folder / information item',
								content: `<p>${_items[i].name} is a Folder / Information and will not be imported.</p>`,
								bg: 'info',
								delay: 1500,
							})
						);
						continue;
					}
				}
				_items[i].tracker.keyName = key;
				_items[i].tracker.color = color;
				await createAppCard(_items[i]);
				setLoaded(i + 1);
			}
			await miro.board.ui.closeModal();
		};

		if (error || trackerDetailsQueryError) {
			// dispatch(
			// 	displayAppMessage({
			// 		header: 'Error loading Items',
			// 		content: <p>Please retry the operation.</p>,
			// 		bg: 'danger',
			// 		delay: 1500,
			// 	})
			// );
			props.onClose;
		} else if (data && key) {
			importItems(data.items as CodeBeamerItem[]).catch((err) =>
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
						{!isLoading && <span>Creating cards</span>}
					</h5>
					<ProgressBar
						className="w-100"
						variant="primary"
						now={loaded}
						max={props.totalItems ?? props.items.length}
						label={`${loaded}/${
							props.totalItems ?? props.items.length
						}`}
						data-test="importProgress"
					/>
				</div>
			</Modal.Body>
		</Modal>
	);
}
