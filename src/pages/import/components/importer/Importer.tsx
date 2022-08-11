import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Spinner from 'react-bootstrap/Spinner';
import { useSelector } from 'react-redux';
import {
	useGetItemsQuery,
	useGetTrackerDetailsQuery,
} from '../../../../api/codeBeamerApi';
import {
	DEFAULT_RESULT_PAGE,
	MAX_ITEMS_PER_IMPORT,
} from '../../../../constants/cb-import-defaults';
import { CodeBeamerItem } from '../../../../models/codebeamer-item.if';
import { RootState } from '../../../../store/store';

import './importer.css';

export default function Importer(props: {
	items: string[];
	onClose?: Function;
}) {
	const { trackerId } = useSelector((state: RootState) => state.userSettings);

	const [loaded, setLoaded] = useState(0);

	const { data, error, isLoading } = useGetItemsQuery({
		page: DEFAULT_RESULT_PAGE,
		pageSize: MAX_ITEMS_PER_IMPORT,
		queryString: `tracker.id = ${trackerId} AND item.id IN (${props.items.join(
			','
		)})`,
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
		if (error || trackerDetailsQueryError) {
			//TODO miro.showErrorNotif
		} else if (data && key) {
			importItems(data.items as CodeBeamerItem[]);
		}
	}, [data, key]);

	const importItems = async (items: CodeBeamerItem[]) => {
		for (let item of items) {
			if (item.categories?.length) {
				if (
					item.categories.find(
						(c) => c.name == 'Folder' || c.name == 'Information'
					)
				) {
					//TODO miro.showNotification("Skipping Folder / Information Item " + item.name);
					continue;
				}
			}
			item.tracker.keyName = key;
			item.tracker.color = color;
			//TODO miroapi createOrUpdateItem(item);
			console.log('card created (not really)');
			setLoaded(loaded + 1);
		}
	};

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
						max={props.items.length}
						label={`${loaded}/${props.items.length}`}
					/>
				</div>
			</Modal.Body>
		</Modal>
	);
}

function wait(ms: number) {
	var start = Date.now(),
		now = start;
	while (now - start < ms) {
		now = Date.now();
	}
}
