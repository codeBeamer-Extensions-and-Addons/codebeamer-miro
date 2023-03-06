export const getColorForRelationshipType = (type: string) => {
	switch (type) {
	  case "depends":
		return "#FF1500"; // Red
	  case "parent":
		return "#008c00"; // Green
	  case "child":
		return "#FFA500"; // Orange
	  case "related":
		return "#0066CC"; // Blue
	  case "derived":
		return "#ADD8E8"; // Lightblue
	  case "copy of":
		return "#00008b"; // Darkblue
	  case "violates":
		return "#c9b00e"; // Darkyellow
	  case "excludes":
		return "#FF00FF"; // Magenta
	  case "invalidates":
	  default:
		return "#000000"; // Black (default color)
	}
}