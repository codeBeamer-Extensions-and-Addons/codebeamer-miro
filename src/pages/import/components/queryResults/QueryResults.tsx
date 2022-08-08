import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useGetItemsQuery } from '../../../../api/codeBeamerApi';
import {
	DEFAULT_ITEMS_PER_PAGE,
	DEFAULT_RESULT_PAGE,
} from '../../../../constants/cb-import-defaults';
import { RootState } from '../../../../store/store';
import QueryResult from '../queryResult/QueryResult';

export default function QueryResults() {
	const [page, setPage] = useState(DEFAULT_RESULT_PAGE);

	const { cbqlString } = useSelector(
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
				{data?.items?.map((i) => (
					<QueryResult item={i} key={i.id} />
				))}
			</table>
		</div>
	);
}
