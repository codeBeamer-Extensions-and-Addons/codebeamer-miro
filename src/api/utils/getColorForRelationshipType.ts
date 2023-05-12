import { RelationshipType } from "../../enums/associationRelationshipType.enum";

export const getColorForRelationshipType = (type: RelationshipType) => {
  switch (type) {
    case RelationshipType.DEPENDS:
      return "#FF1500"; // Red
    case RelationshipType.PARENT:
      return "#008c00"; // Green
    case RelationshipType.CHILD:
      return "#FFA500"; // Orange
    case RelationshipType.RELATED:
      return "#0066CC"; // Blue
    case RelationshipType.DERIVED:
      return "#ADD8E8"; // Lightblue
    case RelationshipType.COPY_OF:
      return "#00008b"; // Darkblue
    case RelationshipType.VIOLATES:
      return "#c9b00e"; // Darkyellow
    case RelationshipType.EXCLUDES:
      return "#FF00FF"; // Magenta
    case RelationshipType.INVALIDATES:
      return "#7100FF"; // Violet
    default:
      return "#000000"; // Black (default color)
  }
};
