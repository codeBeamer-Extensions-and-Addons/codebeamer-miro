import React from 'react';
import { ItemListView } from '../../../../models/itemListView';

export default function QueryResult(props: {
	item: ItemListView;
	checked?: boolean;
	disabled?: boolean;
	onSelect: Function;
}) {
	return (
		<tr>
			<td>
				<input
					type="checkbox"
					className="checkBox"
					checked={props.checked}
					onChange={(e) =>
						props.onSelect(props.item, e.target.checked)
					}
					disabled={props.disabled}
					data-test={'itemCheck-' + props.item.id}
				></input>
			</td>
			<td data-test="itemId">{props.item.id}</td>
			<td data-test="itemName">{props.item.name}</td>
		</tr>
	);
}
