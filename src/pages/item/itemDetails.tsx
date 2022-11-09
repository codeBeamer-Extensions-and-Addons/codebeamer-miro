import { Field, Formik } from 'formik';
import React, { useState } from 'react';
import Select from 'react-select';
import { EDITABLE_ATTRIBUTES } from '../../constants/editable-attributes';
import { CodeBeamerItem } from '../../models/codebeamer-item.if';

export default function ItemDetails() {
	//It's 367 wide, really.
	const PANEL_WIDTH = 500;

	const [item, setItem] = useState<CodeBeamerItem>();
	const [itemId, setItemId] = useState<string>();
	const [cardId, setCardId] = useState<string>();
	const [selectOptions, setSelectOptions] = useState<
		{
			attribute: string;
			options: { name: string; id: string }[];
		}[]
	>();

	React.useEffect(() => {
		const searchParams = new URL(document.location.href).searchParams;
		console.log(document.location.href);
		setItemId(searchParams.get('itemId') ?? '');
		setCardId(searchParams.get('cardId') ?? '');
	}, []);

	const updateValues = (attr: string, value: any) => {
		console.log(`Update ${attr} to ${value}`);
	};

	return (
		<div className="centered-horizontally">
			<h3 className="h3">
				Item {itemId} / Widget {cardId}
			</h3>
			<div className="grid"></div>
		</div>
	);
}
