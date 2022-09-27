import { AppCard, CardField } from '@mirohq/websdk-types';
import { CB_ITEM_NAME_PROPERTY_NAME } from '../../constants/cb-item-name-field-name';
import { StandardItemProperty } from '../../enums/standard-item-property.enum';
import { CodeBeamerItem } from '../../models/codebeamer-item.if';
import { IAppCardTagSettings } from '../../models/import-configuration.if';
import { store } from '../../store/store';
import getCodeBeamerPropertyNameByFieldLabel from './getCodeBeamerPropertyNameByFieldLabel';
import getColorForFieldLabel from './getColorForFieldLabel';

export default function addCardFields(
	cardData: Partial<AppCard>,
	item: CodeBeamerItem
): Partial<AppCard> {
	const NO_IMPORT_CONFIGURATION = 'No import configuration defined';
	let cardTagConfiguration = store.getState().boardSettings
		.cardTagConfiguration as IAppCardTagSettings;

	if (!cardTagConfiguration || !cardTagConfiguration.standard)
		throw new Error(NO_IMPORT_CONFIGURATION);

	const standardConfiguration = cardTagConfiguration.standard;
	const standardConfigurationKeys = Object.keys(standardConfiguration);

	if (!cardData.fields) cardData.fields = [];

	//a foreach on Object.keys got me the ky's indexes instead of keys as entries.
	for (let i = 0; i < standardConfigurationKeys.length; i++) {
		const key = standardConfigurationKeys[i] as StandardItemProperty;
		const value = standardConfiguration[key];

		if (value == false) continue;
		let field;

		const itemPropertyName = getCodeBeamerPropertyNameByFieldLabel(key);
		try {
			field = item[itemPropertyName as keyof CodeBeamerItem];
			if (!field) throw new Error("Field doesn't exist on Item");
		} catch (error) {
			continue;
		}

		let content: string;

		if (field == null) continue;

		if (typeof field === 'object') {
			if (Array.isArray(field)) {
				//* display comma-seperated names of all entries
				content = '';
				for (let j = 0; j < field.length; j++) {
					let entry = field[j];
					let slug = entry[CB_ITEM_NAME_PROPERTY_NAME];
					content += `${slug}, `;
				}
				//remove trailing ", "
				content = content.substring(0, content.length - 2);
			} else {
				//* display the name-property
				content = field[CB_ITEM_NAME_PROPERTY_NAME];
			}
		} else {
			//* just show the field
			content = field.toString();
		}

		let customField: CardField = {
			//TODO custom colors
			fillColor: getColorForFieldLabel(key),
			textColor: '#ffffff',
			value: `${key}: ${content}`,
		};
		cardData.fields.push(customField);
	}

	//status is always displayed, if the item has one
	if (item.status) {
		cardData.fields.push({
			fillColor: '#4f8ae8',
			textColor: '#ffffff',
			value: `Status: ${item.status.name}`,
		});
	}

	return cardData;
}
