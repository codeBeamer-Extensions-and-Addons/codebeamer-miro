import { forEach } from 'cypress/types/lodash';
import React, { useState } from 'react';
import { useGetItemRelationsQuery, useGetAssociationQuery, useLazyGetAssociationQuery } from '../../../api/codeBeamerApi';
import { createConnectorsForDownstreamRefsAndAssociation } from '../../../api/miro.api';
import Importer from '../../import/components/importer/Importer';

export default function ItemActions(props: { itemId: string | number, cardId: string | number }) {
	const [loadDownstreamReferencesDisabled, setloadDownstreamReferencesDisabled] = useState<boolean>(true);
	const [showDependenciesDisabled, setShowDependenciesDisabled] = useState<boolean>(true);
	const [itemIds, setItemIds] = useState<string[]>([]);
	const [queryString, setQueryString] = useState<string>('');
	const [downstreamRefs, setDownstreamRefs] = useState<number[]>([]);
	const [associations, setAssociations] = useState([]);


	const { data, error, isLoading } = useGetItemRelationsQuery(props.itemId);

	// const [ triggerGetAssociation, associationQueryResult ] = useLazyGetAssociationQuery();

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

	//get all downstreamRefs and associations and then call in the miro.api a method which creates all connectors
	// { downstreamRefs: [number], associations: [{associationId: number, targetItemId: number}] }
	React.useEffect(() => {
		async function fetchData() {
			if (data && (data.downstreamReferences.length || data.outgoingAssociations.length)) {
			var downstreamRefs: React.SetStateAction<number[]> = [];
			var associations: ((prevState: never[]) => never[]) | { associationId: number; targetItemId: number; }[] = [];
			if (data.downstreamReferences.length) {
				data.downstreamReferences.forEach(function (downstreamReference) {
				downstreamRefs.push(downstreamReference.itemRevision.id);
				});
			}
			if (data.outgoingAssociations.length) {
				data.outgoingAssociations.forEach(function (outgoingAssociation) {
				var association = {associationId: outgoingAssociation.id, targetItemId: outgoingAssociation.itemRevision.id};
				associations.push(association);
				});
			}


			setDownstreamRefs(downstreamRefs);
			setAssociations(associations);
			}
		}
	  
		fetchData();
	}, [data]);
	  

	const showDependenciesHandler = async () => {
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
			
		  
			const startCardId = await findAppCardId(props.itemId.toString());
			await createConnectorsForDownstreamRefsAndAssociation(startCardId, downstreamRefs, associations);
			
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
