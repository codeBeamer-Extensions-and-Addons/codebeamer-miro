/**
 * A modelization of items as result of a (cbql) query.
 * Differs from the list view by specifying the "selected" property.
 */
export class ItemQueryResultView {
	id: number | string;
	name: string;
	selected: boolean;

	/**
	 *
	 */
	constructor(id: number | string, name: string, selected = false) {
		this.id = id;
		this.name = name;
		this.selected = selected;
	}
}
