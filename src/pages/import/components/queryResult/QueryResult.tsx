import React, { useRef } from 'react';
import { ItemListView } from '../../../../models/itemListView';

export default function QueryResult(props: {
	item: ItemListView;
	checked?: boolean;
	disabled?: boolean;
	onSelect: Function;
}) {
	const checkbox = useRef<HTMLInputElement>(null);

	React.useEffect(() => {
		if (checkbox.current) {
			checkbox.current.checked = props.checked ?? false;
		}
	}, []);

	return (
		<tr>
			<td>
				<input
					type="checkbox"
					className="checkBox"
					onChange={(e) =>
						props.onSelect(props.item, e.target.checked)
					}
					disabled={props.disabled}
					data-test={'itemCheck-' + props.item.id}
					ref={checkbox}
				></input>
			</td>
			<td data-test="itemId">{props.item.id}</td>
			<td data-test="itemName">{props.item.name}</td>
		</tr>
	);
}
