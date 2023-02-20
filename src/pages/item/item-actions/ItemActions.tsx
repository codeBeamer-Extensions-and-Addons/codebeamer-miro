import { forEach } from 'cypress/types/lodash';
import React, { useState } from 'react';
import { useGetItemRelationsQuery, useGetAssociationQuery } from '../../../api/codeBeamerApi';
import Importer from '../../import/components/importer/Importer';

export default function ItemActions(props: { itemId: string | number, cardId: string | number }) {
	const [loadDownstreamReferencesDisabled, setloadDownstreamReferencesDisabled] = useState<boolean>(true);
	const [showDependenciesDisabled, setShowDependenciesDisabled] = useState<boolean>(true);
	const [itemIds, setItemIds] = useState<string[]>([]);
	const [queryString, setQueryString] = useState<string>('');

	const { data, error, isLoading } = useGetItemRelationsQuery(props.itemId);
	const {data: data2, error: error2, isLoading: isLoading2 } = useGetAssociationQuery(9783166);

	const loadDownstreamReferencesHandler = () => {
		if (data && !loadDownstreamReferencesDisabled) {
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

	const showDependenciesHandler = async () => {

		// loadCards
		// if (data && !showDependenciesDisabled) {
		// 	const ids = data.outgoingAssociations.map((d) =>
		// 		d.itemRevision.id.toString()
		// 	);
		// 	setItemIds(ids);
		// 	setQueryString(`item.id IN (${ids.join(',')})`);
		// } else {
		// 	console.warn(
		// 		"Can't load Associations - data still loading or failed to do so."
		// 	);
		// }

		if (data && !showDependenciesDisabled) {
			const ids = data.outgoingAssociations.map((d) =>
				d.itemRevision.id.toString()
			);
			setItemIds(ids);
		  
			const startCardId = await findAppCardId(props.itemId.toString())
		  
			for (const id of ids) {		  
			  const endCardId = await findAppCardId(id)
		  
			  if (startCardId && endCardId) {
				const connector = await miro.board.createConnector({
				  start: {
					item: startCardId.toString()
				  },
				  end: {
					item: endCardId.toString()
				  }
				});
				console.log(`Connector created between ${startCardId} and ${endCardId}:`, connector);
			  } else {
				console.warn(`Could not find app_card for id: ${id}`);
			  }
			}
		  } else {
			console.warn("Can't load Associations - data still loading or failed to do so.");
		  }
		  
		
	};

	const findAppCardId = async (id: string) => {
		const appCards = await miro.board.get({ type: 'app_card' })
		const filteredCards = appCards.filter((card) =>
		  card.title.includes(id)
		)
		return filteredCards.length > 0 ? filteredCards[0].id : null
	  }

	React.useEffect(() => {
		if (error) {
			setloadDownstreamReferencesDisabled(true);
			setShowDependenciesDisabled(true);
			return;
		} else if (data) {
			if (!data.downstreamReferences.length) {
				setloadDownstreamReferencesDisabled(true);
			} else {
				setloadDownstreamReferencesDisabled(false);
			}
			if (!data.outgoingAssociations.length) {
				setShowDependenciesDisabled(true);
			} else {
				setShowDependenciesDisabled(false);
			}
		}
	}, [data, error]);

	React.useEffect(() => {
		console.log("useeffect started")
		console.log(data2)
		if(data2){
			console.log("data2: ", data2)
		}

		if(error2){
			console.log("error2: ", error2)
		}

	}, [data2, error2])

	return (
		<div>
			<button
				className={`button button-tertiary ${
					isLoading ? 'button-loading button-loading-primary' : ''
				}`}
				onClick={loadDownstreamReferencesHandler}
				disabled={loadDownstreamReferencesDisabled}
				data-test="load-downstream-references"
				title="Load the Item's Downstream References onto the board, if they're not yet there"
			>
				{!isLoading && (
					<>
						<span className="icon-add-row-bottom"></span>
						<span>Load Downstream References</span>
					</>
				)}
				{data && ` (${data.downstreamReferences.length})`}
			</button>
			<button
				className={`button button-tertiary ${
					isLoading ? 'button-loading button-loading-primary' : ''
				}`}
				onClick={showDependenciesHandler}
				disabled={showDependenciesDisabled}
				data-test="show-dependency"
				title="Show Dependency & Associations"
			>
				{!isLoading && (
					<>
						<span className="icon-add-row-bottom"></span>
						<span>Show Dependency & Associations</span>
					</>
				)}
			</button>
			{queryString && (
				<Importer items={itemIds} queryString={queryString} />
			)}
		</div>
	);
}
