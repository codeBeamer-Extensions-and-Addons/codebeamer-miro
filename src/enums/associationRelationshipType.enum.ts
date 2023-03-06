/**
 * Enumeration of the type of relation between associatons
 */
export enum RelationshipType {
	DEPENDS = "depends",
	PARENT = "parent",
	CHILD = "child",
	RELATED = "related",
	DERIVED = "derived",
	COPY_OF = "copy of",
	VIOLATES = "violates",
	EXCLUDES = "excludes",
	INVALIDATES = "invalidates",
	DOWNSTREAM = "downstream"
}

export function getRelationshipType(value: string): RelationshipType {
	for (const enumValue in RelationshipType) {
	  if (RelationshipType[enumValue] === value) {
		return enumValue as RelationshipType;
	  }
	}
	throw new Error(`Unknown RelationshipType value: ${value}`);
  }
