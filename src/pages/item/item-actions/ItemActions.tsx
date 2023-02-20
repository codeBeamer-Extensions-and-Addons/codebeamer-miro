import { forEach } from 'cypress/types/lodash';
import React, { useState } from 'react';
import { useGetItemRelationsQuery, useGetAssociationQuery } from '../../../api/codeBeamerApi';
import Importer from '../../import/components/importer/Importer';

export default function ItemActions(props: { itemId: string | number, cardId: string | number }) {
	const [loadDownstreamReferencesDisabled, setloadDownstreamReferencesDisabled] = useState<boolean>(true);
	const [showDependenciesDisabled, setShowDependenciesDisabled] = useState<boolean>(true);
	const [itemIds, setItemIds] = useState<string[]>([]);
	const [associationId, setAssociationId] = useState<string>('');
	const [queryString, setQueryString] = useState<string>('');

	const { data, error, isLoading } = useGetItemRelationsQuery(props.itemId);

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
			const { itemIds, associationIds } = data.outgoingAssociations.reduce(
				(acc, curr) => {
					acc.itemIds.push(curr.itemRevision.id.toString());
					acc.associationIds.push(curr.id.toString());
					return acc;
				},
				{ itemIds: [], associationIds: [] }
			);
			setItemIds(itemIds);
			
		  
			const startCardId = await findAppCardId(props.itemId.toString())
		  
			for (const [index, id] of itemIds.entries()) {
				const endCardId = await findAppCardId(id);
				
				setAssociationId(associationIds[index])
			
				if (startCardId && endCardId) {
					const connector = await miro.board.createConnector({
					start: {
						item: startCardId.toString()
					},
					end: {
						item: endCardId.toString()
					}
					});
					console.log(`Connector ${index} created between ${startCardId} and ${endCardId}:`, connector);
				} else {
					console.warn(`Could not find app_card for id ${index}: ${id}`);
				}
			}
		  } else {
			console.warn("Can't load Associations - data still loading or failed to do so.");
		  }
		  setAssociationId('')
	};

	const findAppCardId = async (id: string) => {
		const appCards = await miro.board.get({ type: 'app_card' })
		const filteredCards = appCards.filter((card) =>
		  card.title.includes(id)
		)
		return filteredCards.length > 0 ? filteredCards[0].id : null
	}

	const waitForAssociationData = async () => {
		while (associationLoading) {
			console.log("loading")
		  await new Promise(resolve => setTimeout(resolve, 100));
		}
	  };

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
		if(associationId !== ''){
			const { data, error, isLoading } = useGetAssociationQuery(associationId);
			console.log("associationData", data)
		}
		
	}, [associationId]);

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
