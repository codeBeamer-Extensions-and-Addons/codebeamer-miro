import { BoardSetting, LocalSetting, SessionSetting } from '../../entities';
import CodeBeamerService from '../../services/codebeamer';
import MiroService from '../../services/miro';
import Store from '../../services/store';

miro.onReady(async () => {
	Store.create(miro.getClientId(), (await miro.board.info.get()).id);

	loadFieldValuesFromStorage();
});

function loadFieldValuesFromStorage(): void {
	setFieldFromBoardSettings(BoardSetting.CB_ADDRESS);
	setFieldFromBoardSettings(BoardSetting.INBOX_TRACKER_ID);
	setFieldFromBoardSettings(BoardSetting.PROJECT_ID);
	setFieldFromPrivateSettings(LocalSetting.CB_USERNAME);
	setFieldFromSessionSettings(SessionSetting.CB_PASSWORD);
}

function setFieldFromPrivateSettings(fieldIdAndSettingName: LocalSetting) {
	let value = Store.getInstance().getLocalSetting(fieldIdAndSettingName);
	if (value) {
		let field = document.getElementById(fieldIdAndSettingName);
		if (field) field['value'] = value;
	}
}

function setFieldFromBoardSettings(fieldIdAndSettingName: BoardSetting) {
	let value;
	try {
		value = Store.getInstance().getBoardSetting(fieldIdAndSettingName);
		let field = document.getElementById(fieldIdAndSettingName);
		if (field) field['value'] = value;
	} catch (error) {
		return;
	}
}

function setFieldFromSessionSettings(fieldIdAndSettingName: SessionSetting) {
	let value = Store.getInstance().getSessionSetting(fieldIdAndSettingName);
	if (value) {
		let field = document.getElementById(fieldIdAndSettingName);
		if (field) field['value'] = value;
	}
}

function addValueOfFieldToObject(
	object: any,
	fieldId: BoardSetting | LocalSetting | SessionSetting
) {
	let field = document.getElementById(fieldId);
	let value = field ? field['value'] : null;
	object[fieldId] = value;
	return object;
}

async function saveAndTestSettings() {
	let boardSettings = {};
	addValueOfFieldToObject(boardSettings, BoardSetting.CB_ADDRESS);
	addValueOfFieldToObject(boardSettings, BoardSetting.INBOX_TRACKER_ID);
	addValueOfFieldToObject(boardSettings, BoardSetting.PROJECT_ID);

	let localSettings = {};
	addValueOfFieldToObject(localSettings, LocalSetting.CB_USERNAME);

	let sessionSettings = {};
	addValueOfFieldToObject(sessionSettings, SessionSetting.CB_PASSWORD);

	await Promise.all([
		Store.getInstance().saveBoardSettings(boardSettings),
		Store.getInstance().saveLocalSettings(localSettings),
		Store.getInstance().saveSessionSettings(sessionSettings),
	]);

	await CodeBeamerService.getInstance()
		.getCodeBeamerUser()
		.then((cbUser) => {
			MiroService.getInstance()
				.getCurrentUserId()
				.then((miroUserId) => {
					Store.getInstance().storeUserMapping({
						cbUserId: cbUser.id,
						miroUserId: miroUserId,
					});
				});
			miro.showNotification(
				`Connection with "${boardSettings['cbAddress']}" API OK!`
			);
			miro.board.ui.closeModal();
		})
		.catch((err) => {
			miro.showErrorNotification(
				`Connection to "${boardSettings['cbAddress']}" API could not be established: ${err}`
			);
			console.error('CB connection could not be established: ', err);
		});
}

let saveButton = document.getElementById('saveButton');
if (saveButton) saveButton.onclick = saveAndTestSettings;
