/**
 *
 * @return The entitty's legacy REST api uri
 */
export default function getRestResourceUri(
	id: number | string,
	type: string = 'item'
) {
	if (type.includes('Reference')) type = type.split('Reference')[0];
	if (type.includes('Tracker')) type = type.split('Tracker')[1];
	return `/${type.toLowerCase()}/${id}`;
}

/**
 *
 * @param restResourceUri Legacy REST resource uri of the form "/{entityType}/{id}"
 * @return the entity's id
 */
export function getIdFromRestResourceUri(restResourceUri: string) {
	let pathParts = restResourceUri.split('/');
	return pathParts[pathParts.length - 1];
}
