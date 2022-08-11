import { store } from '../../store/store';

export default function getCbItemUrl(itemId: string) {
	return `${store.getState().boardSettings.cbAddress}/issue/${itemId}`;
}
