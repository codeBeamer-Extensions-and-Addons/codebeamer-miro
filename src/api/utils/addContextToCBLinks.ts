const hrefRegex = /href\=\"\/cb/g;
const srcRegex = /src\=\"\/cb/g;

/**
 * Updates src- and href attributes in given value to absolute paths, if they start with /cb
 * @param cbBaseUrl BaseURL of the intended cb instance ending with "/cb"
 * @param value String to update the links in
 * @returns String with relative cb-paths replaced by absolute ones and links having target="_blank"
 */
export default function addContextToCBLinks(cbBaseUrl: string, value: string) {
	console.log(value.match(hrefRegex));
	value = value.replaceAll(hrefRegex, `href="${cbBaseUrl}`);
	value = value.replaceAll(srcRegex, `src="${cbBaseUrl}`);

	value = value.replaceAll(/\<a /g, `<a target="_blank" `);

	return value;
}
