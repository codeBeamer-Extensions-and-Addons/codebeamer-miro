import { RenderingContextType } from '../enums/renderingContextType.enum';

/**
 * Structure of the request body for a wiki2html request.
 */
export interface Wiki2HtmlQuery {
	contextId: number;
	contextVersion: number;
	renderingContextType: RenderingContextType;
	markup: string;
}
