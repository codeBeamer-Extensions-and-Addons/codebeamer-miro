import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLazyGetItemQuery } from '../../api/codeBeamerSwaggerApi';
import { CodeBeamerItem } from '../../models/codebeamer-item.if';
import { loadBoardSettings } from '../../store/slices/boardSettingsSlice';
import { RootState } from '../../store/store';

//It's 367 wide, really.
const PANEL_WIDTH = 500;

export default function ItemDetails() {
	const dispatch = useDispatch();

	const { cbAddress } = useSelector(
		(state: RootState) => state.boardSettings
	);
	const [storeIsInitializing, setStoreIsInitializing] =
		useState<boolean>(true);
	const [item, setItem] = useState<CodeBeamerItem>();

	const searchParams = new URL(document.location.href).searchParams;
	console.log(document.location.href);

	const itemId = searchParams.get('itemId');
	if (!itemId) {
		//TODO
	}
	const cardId = searchParams.get('cardId');

	React.useEffect(() => {
		console.log('Dispatchign board setting load');
		dispatch(loadBoardSettings());
		if (cbAddress) {
			console.log('Cb address truthy: ', cbAddress);
			setStoreIsInitializing(false);
			trigger(itemId!);
		}
	}, []);

	React.useEffect(() => {
		console.log('cbAddress effect');
		if (cbAddress) {
			setStoreIsInitializing(false);
			trigger(itemId!);
		}
	}, [cbAddress]);

	const [trigger, result, lastPromiseInfo] = useLazyGetItemQuery();

	React.useEffect(() => {
		if (result.error) {
			//TODO
		} else if (result.data) {
			setItem(result.data);
		}
	}, [result]);

	const updateValues = (attr: string, value: any) => {
		console.log(`Update ${attr} to ${value}`);
	};

	return (
		<>
			{storeIsInitializing ||
				(result.isLoading && (
					<div className="centered loading-spinner"></div>
				))}
			<div className="fade-in centered-horizontally">
				<h3 className="h3">
					Item {itemId} / Widget {cardId}
				</h3>
				<div className="grid">
					<label>Item:</label>
					{item && <p>{JSON.stringify(item)}</p>}
				</div>
			</div>
		</>
	);
}
