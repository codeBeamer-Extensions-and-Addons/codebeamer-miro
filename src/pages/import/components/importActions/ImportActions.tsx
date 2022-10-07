import React from 'react';
import { AppCardToItemMapping } from '../../../../models/appCardToItemMapping.if';

import './importActions.css';

export default function ImportActions(props: {
	selectedCount: number;
	totalCount: number;
	importedItems: AppCardToItemMapping[];
	onImportSelected: Function;
	onImportAll: Function;
	onSync: Function;
}) {
	return (
		<div className="w-100 flex-row">
			<button
				className="button button-primary button-small flex flex-centered"
				onClick={() => props.onImportSelected()}
				disabled={props.selectedCount == 0}
				data-test="importSelected"
			>
				<span className="mr-5p">
					<svg
						width="24"
						height="24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M11 12.172L8.707 9.879a1 1 0 00-1.414 1.414L12 16l4.707-4.707a1 1 0 00-1.414-1.414L13 12.172V2.586a1 1 0 10-2 0v9.586zM3 19a1 1 0 100 2h18a1 1 0 100-2H3z"
							fill="#fff"
						/>
					</svg>
				</span>
				Import Selected ({props.selectedCount})
			</button>
			<button
				className="button button-primary button-small flex flex-centered"
				onClick={() => props.onImportAll()}
				data-test="importAll"
			>
				<span className="mr-5p">
					<svg
						width="24"
						height="24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M11 12.172L8.707 9.879a1 1 0 00-1.414 1.414L12 16l4.707-4.707a1 1 0 00-1.414-1.414L13 12.172V2.586a1 1 0 10-2 0v9.586zM3 19a1 1 0 100 2h18a1 1 0 100-2H3z"
							fill="#fff"
						/>
					</svg>
				</span>
				Import all ({props.totalCount})
			</button>
			<button
				className="button button-secondary button-small flex flex-centered"
				disabled={props.importedItems.length == 0}
				data-test="sync"
				onClick={() => props.onSync()}
			>
				<span className="icon icon-refresh mr-1 pos-adjusted-down"></span>
				Sync ({props.importedItems.length})
			</button>
		</div>
	);
}
