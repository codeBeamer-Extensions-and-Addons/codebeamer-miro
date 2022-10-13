import { CodeBeamerItem } from '../../models/codebeamer-item.if';

/**
 * Searches for a custom field with type "ColorFieldValue" and if it finds one, returns this field's value.
 * @param item {@link CodeBeamerItem} in question
 * @returns Hex color value or undeinfed if no ColorField customfield exists
 */
export default function getItemColorField(
	item: CodeBeamerItem
): string | undefined {
	var colorField = item.customFields
		? item.customFields.find((field) => field.type === 'ColorFieldValue')
		: undefined;
	return colorField ? colorField.value : undefined;
}
