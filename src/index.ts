async function init() {
	miro.board.ui.on('icon:click', async () => {
		await miro.board.ui.openModal({
			url: 'app.html',
			height: 680,
			width: 1080,
		});
	});

	miro.board.ui.on('app_card:open', async (_event) => {
		console.log('AppCardOpen Event: ', _event);
	});

	console.info(
		`[codeBeamer-sync] Plugin v0.13.0 initialized. Experiencing issues? Let us know at https://github.com/codeBeamer-Extensions-and-Addons/codebeamer-miro/issues`
	);
}

init();
