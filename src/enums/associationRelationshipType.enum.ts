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
  DOWNSTREAM = "downstream",
}
