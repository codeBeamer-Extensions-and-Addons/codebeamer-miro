import React from 'react';
import { ItemListView } from '../../../../models/itemListView';

export default function QueryResult(props: {
	item: ItemListView;
	onSelect: Function;
}) {
	return (
		<tr>
			<td>
				<input
					type="checkbox"
					className="checkBox"
					onChange={(e) =>
						props.onSelect(props.item, e.target.checked)
					}
				></input>
			</td>
			<td>{props.item.id}</td>
			<td>{props.item.name}</td>
		</tr>
	);
}
