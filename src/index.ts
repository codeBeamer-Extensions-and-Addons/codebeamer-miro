import { convertToCardData } from './api/miro.api';
import { CodeBeamerItem } from './models/codebeamer-item.if';
import { BoardSetting } from './store/boardSetting.enum';
import { UserSetting } from './store/userSetting.enum';

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
		//* experimental, tracker data currently lost on sync
		//* additionally, can't really ever resync
		//* and it's kinda ugly

		let { appCard } = _event;

		const cbBaseUrl = await miro.board.getAppData(BoardSetting.CB_ADDRESS);
		const username = localStorage.getItem(UserSetting.CB_USERNAME);
		const password = sessionStorage.getItem(UserSetting.CB_PASSWORD);

		const itemKey = appCard.title.match(/\[[a-zA-Z0-9]*-?([0-9]+)\]/);

		if (!itemKey?.length) {
			//TODO miro showErrorNotif
			console.error("Couldn't extract ID from Card title. Can't sync!");
			return;
		}
		const itemId = itemKey[1];

		const data = (await (
			await fetch(`${cbBaseUrl}/api/v3/items/${itemId}`, {
				method: 'GET',
				headers: new Headers({
					'Content-Type': 'application/json',
					Authorization: `Basic ${btoa(username + ':' + password)}`,
				}),
			})
		).json()) as CodeBeamerItem;

		//TODO get/retrieve tracker keyName & color
		const updatedCardData = await convertToCardData(data);

		console.log('Data: ', updatedCardData);
		console.log('Appcard old: ', appCard);

		appCard.title = updatedCardData.title ?? appCard.title;
		appCard.description =
			updatedCardData.description ?? appCard.description;
		appCard.fields = updatedCardData.fields ?? appCard.fields ?? [];

		console.log('New card: ', appCard);

		appCard.status = 'connected';
		await appCard.sync();
	});

	console.info(
		`[codeBeamer-sync] Plugin v1.0.0 initialized. Experiencing issues? Let us know at https://github.com/codeBeamer-Extensions-and-Addons/codebeamer-miro/issues`
	);
}

init();
