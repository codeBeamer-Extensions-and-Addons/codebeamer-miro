import React from 'react';
import { ItemListView } from '../../../../models/itemListView';

export default function QueryResult(props: { item: ItemListView }) {
	return (
		<tr>
			<td>
				<input type="checkbox" className="checkBox"></input>
			</td>
			<td>{props.item.id}</td>
			<td>{props.item.name}</td>
		</tr>
	);
}
