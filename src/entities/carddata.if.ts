export interface CardData {
	metadata?: SDK.WidgetMetadata;
	capabilities?: SDK.WidgetCapabilities;
	clientVisible?: boolean;
	type: "CARD";
	x?: number;
	y?: number;
	scale?: number;
	rotation?: number;
	title?: string;
	description?: string;
	date?: string; // date in "YYYY-MM-DD" format
	assignee?: {
		userId: string;
	};
	card?: {
		customFields?: {
			value?: string;
			mainColor?: string;
			fontColor?: string;
			iconUrl?: string;
			roundedIcon?: boolean;
		}[];
		logo?: {
			iconUrl: string;
		};
	};
	style?: {
		backgroundColor: SDK.BackgroundColorStyle;
	};
}
