import getItemIdFromCardTitle from './api/utils/getItemIdFromCardTitle';

async function init() {
	miro.board.ui.on('icon:click', async () => {
		await miro.board.ui.openModal({
			url: 'app.html',
			height: 680,
			width: 1080,
		});
	});

	miro.board.ui.on('app_card:open', async (_event) => {
		const cardId = _event.appCard.id;
		const itemId = getItemIdFromCardTitle(_event.appCard.title);

		miro.board.ui.openPanel({
			url: `item.html?cardId=${cardId}&itemId=${itemId}`,
		});

		return;
	});

	miro.board.ui.on('app_card:connect', async (_event) => {
		const { appCard } = _event;
		appCard.status = 'connected';
		appCard.sync();

		const message =
			"Clicking the 'Connect' button does not establish a persistent connection or update the item's data. " +
			"But it allows to now open the Item's details (which updates it too) with the icon that appeared in the same place.";
		console.info(message);
	});

	console.info(
		`[codeBeamer-cards] Plugin v1.3.0 initialized. Experiencing issues? Let us know at https://github.com/codeBeamer-Extensions-and-Addons/codebeamer-miro/issues`
	);
}

init();
