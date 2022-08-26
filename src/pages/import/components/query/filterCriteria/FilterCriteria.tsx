import React from 'react';
import { IFilterCriteria } from '../../../../../models/filterCriteria.if';

import './filterCriteria.css';

export default function FilterCriteria(props: {
	filterCriteria: IFilterCriteria;
	onRemove: Function;
	showId?: boolean;
}) {
	return (
		<span className="tag" data-test={`criteria-${props.filterCriteria.id}`}>
			{`${props.showId ? props.filterCriteria.id + ') ' : ''}${
				props.filterCriteria.slug
			}: ${props.filterCriteria.value}`}
			<div
				className="filter-remove"
				data-test={`remove-${props.filterCriteria.id}`}
				onClick={() => props.onRemove(props.filterCriteria.id)}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="ionicon"
					viewBox="0 0 512 512"
				>
					<title>Remove Filter</title>
					<path
						fill="none"
						stroke="currentColor"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="32"
						d="M368 368L144 144M368 144L144 368"
					/>
				</svg>
			</div>
		</span>
	);
}
