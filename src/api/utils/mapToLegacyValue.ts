import getRestResourceUri from './getRestResourceUri';

/**
 * This function's prupose is to map an item's value for any field to a simple
 * representation, which can be used to update it with the REST API.
 *
 * @return The cluttered data broekn down to a uri and name pair.
 */
export default function mapToLegacyValue(cluttered: {
	name: string;
	id?: string | number;
	type?: string;
	uri?: string;
}) {
	if (!cluttered.id && !cluttered.uri)
		throw new Error('Data must have either id or uri!');
	return {
		uri: cluttered.uri ?? getRestResourceUri(cluttered.id!, cluttered.type),
		name: cluttered.name,
	};
}
