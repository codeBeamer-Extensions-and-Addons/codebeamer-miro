import { convertToCardData, updateAppCard } from './api/miro.api';
import { CARD_TITLE_ID_FILTER_REGEX } from './constants/cardTitleIdFilterRegex';
import { CodeBeamerItem } from './models/codebeamer-item.if';
import TrackerDetails from './models/trackerDetails.if';
import { BoardSetting } from './store/enums/boardSetting.enum';
import { UserSetting } from './store/enums/userSetting.enum';

async function init() {
	miro.board.ui.on('icon:click', async () => {
		await miro.board.ui.openModal({
			url: 'app.html',
			height: 680,
			width: 1080,
		});
	});

	miro.board.ui.on('app_card:open', async (_event) => {
		//* experimental, just to have something there.
		//* except that codeBeamer has x-fram-origin = samesite

		console.log('AppCardOpen Event: ', _event);
		const { appCard } = _event;
		const href = appCard.title.match(/(href\=\")[a-zA-Z0-9\.\/\:]+(\")/);
		if (!href?.length) {
			//TODO miro showErrorNotif
			console.error('No URL match on the item');
			return;
		}
		const url = href[0].substring(6, href[0].length - 1);

		if (url.includes('localhost') || url.includes('github')) {
			//TODO miro.showErrorNotif
			console.warn(
				"Can't open App Card Details: Invalid CodeBeamer Address - Is it not configured?"
			);
			return;
		}

		miro.board.ui.openModal({
			url,
		});
	});

	miro.board.ui.on('app_card:connect', async (_event) => {
		//* Sync the item (once). Doesn't

		let { appCard } = _event;

		const cbBaseUrl = await miro.board.getAppData(BoardSetting.CB_ADDRESS);
		const username = localStorage.getItem(UserSetting.CB_USERNAME);
		const trackerId = localStorage.getItem(UserSetting.SELECTED_TRACKER);
		const password = sessionStorage.getItem(UserSetting.CB_PASSWORD);

		const itemKey = appCard.title.match(CARD_TITLE_ID_FILTER_REGEX);

		if (!itemKey?.length) {
			//TODO miro showErrorNotif
			console.warn("Couldn't extract ID from Card title. Can't sync!");
			return;
		}
		const itemId = itemKey[1];

		const requestArgs = {
			method: 'GET',
			headers: new Headers({
				'Content-Type': 'application/json',
				Authorization: `Basic ${btoa(username + ':' + password)}`,
			}),
		};

		const cbItem = (await (
			await fetch(`${cbBaseUrl}/api/v3/items/${itemId}`, requestArgs)
		).json()) as CodeBeamerItem;

		const trackerData = (await (
			await fetch(
				`${cbBaseUrl}/api/v3/trackers/${trackerId}`,
				requestArgs
			)
		).json()) as TrackerDetails;

		cbItem.tracker.keyName = trackerData.keyName;
		cbItem.tracker.color = trackerData.color;

		try {
			await updateAppCard(cbItem, appCard.id);
		} catch (e: any) {
			console.error('Failed updating app card: ', e);
			//TODO miro.showErrorNotif
		}
	});

	console.info(
		`[codeBeamer-sync] Plugin v1.0.0 initialized. Experiencing issues? Let us know at https://github.com/codeBeamer-Extensions-and-Addons/codebeamer-miro/issues`
	);
}

init();
