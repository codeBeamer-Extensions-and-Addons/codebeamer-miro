import React, { useState } from 'react';
import { useLazyGetItemRelationsQuery } from '../../../api/codeBeamerApi';
import Importer from '../../import/components/importer/Importer';

export default function ItemActions(props: { itemId: string | number }) {
	const [itemIds, setItemIds] = useState<string[]>([]);
	const [queryString, setQueryString] = useState<string>('');

	const [trigger, result] = useLazyGetItemRelationsQuery();

	const clickHandler = () => {
		trigger(props.itemId);
	};

	React.useEffect(() => {
		if (result.error) {
			return;
		} else if (result.data) {
			setItemIds(
				result.data.downstreamReferences.map((d) =>
					d.itemRevision.id.toString()
				)
			);
		}
	}, [result]);

	React.useEffect(() => {
		if (itemIds.length) {
			setQueryString(`item.id IN (${itemIds.join(',')})`);
		}
	}, [itemIds]);

	return (
		<div className="flex-centered">
			<button className="button button-tertiary" onClick={clickHandler}>
				<span className="icon-add-row-bottom"></span>
				Load Downstream References
			</button>
			{queryString && (
				<Importer items={itemIds} queryString={queryString} />
			)}
		</div>
	);
}
