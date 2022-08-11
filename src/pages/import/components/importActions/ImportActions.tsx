import React, { useState } from 'react';

export default function ImportActions(props: {
	selectedCount: number;
	totalCount: number;
}) {
	const [synchedItems, setSynchedItems] = useState(0);

	React.useEffect(() => {
		//TODO how many Items are on the board?
	}, []);

	return (
		<div className="w-100 flex-row">
			<button className="button button-primary">
				<span className="icon icon-download mr-1 pos-adjusted-down"></span>
				Import Selected ({props.selectedCount})
			</button>
			<button className="button button-primary">
				<span className="icon icon-download mr-1 pos-adjusted-down"></span>
				Import all ({props.totalCount})
			</button>
			<button
				className="button button-secondary"
				disabled={synchedItems == 0}
			>
				<span className="icon icon-refresh mr-1 pos-adjusted-down"></span>
				Sync ({synchedItems})
			</button>
		</div>
	);
}
