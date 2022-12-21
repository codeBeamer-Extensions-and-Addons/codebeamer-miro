import React, { useState } from 'react';
import { useGetItemRelationsQuery } from '../../../api/codeBeamerApi';
import Importer from '../../import/components/importer/Importer';

export default function ItemActions(props: { itemId: string | number }) {
	const [disabled, setDisabled] = useState<boolean>(true);
	const [itemIds, setItemIds] = useState<string[]>([]);
	const [queryString, setQueryString] = useState<string>('');

	const { data, error, isLoading } = useGetItemRelationsQuery(props.itemId);

	const clickHandler = () => {
		if (data && !disabled) {
			const ids = data.downstreamReferences.map((d) =>
				d.itemRevision.id.toString()
			);
			setItemIds(ids);
			setQueryString(`item.id IN (${ids.join(',')})`);
		} else {
			console.warn(
				"Can't load Downstream References - data still loading or failed to do so."
			);
		}
	};

	React.useEffect(() => {
		if (error) {
			setDisabled(true);
			return;
		} else if (data) {
			if (!data.downstreamReferences.length) {
				setDisabled(true);
			} else {
				setDisabled(false);
			}
		}
	}, [data, error]);

	return (
		<div className="flex-centered">
			<button
				className={`button button-tertiary ${
					isLoading ? 'button-loading button-loading-primary' : ''
				}`}
				onClick={clickHandler}
				disabled={disabled}
			>
				{!isLoading && (
					<>
						<span className="icon-add-row-bottom"></span>
						<span>Load Downstream References</span>
					</>
				)}
				{data && ` (${data.downstreamReferences.length})`}
			</button>
			{queryString && (
				<Importer items={itemIds} queryString={queryString} />
			)}
		</div>
	);
}
