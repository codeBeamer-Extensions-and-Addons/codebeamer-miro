import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useGetItemsQuery } from '../../../../api/codeBeamerApi';
import {
	DEFAULT_ITEMS_PER_PAGE,
	DEFAULT_RESULT_PAGE,
} from '../../../../constants/cb-import-defaults';
import { RootState } from '../../../../store/store';
import QueryResult from '../queryResult/QueryResult';

import './queryResults.css';

export default function QueryResults() {
	const [page, setPage] = useState(DEFAULT_RESULT_PAGE);

	const { cbqlString, trackerId } = useSelector(
		(state: RootState) => state.userSettings
	);

	const { data, error, isLoading } = useGetItemsQuery({
		page: page,
		pageSize: DEFAULT_ITEMS_PER_PAGE,
		queryString: cbqlString,
	});

	React.useEffect(() => {
		console.error(error);
		//TODO miro.showErrorNotif
	}, [error]);

	if (data && (data.total == 0 || !data.items.length)) {
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
				<table className="table">
					<thead>
						<tr>
							<td>Imported</td>
							<td>ID</td>
							<td>Name</td>
						</tr>
					</thead>
					<tbody>
						{data?.items?.map((i) => (
							<QueryResult item={i} key={i.id} />
						))}
					</tbody>
				</table>
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
