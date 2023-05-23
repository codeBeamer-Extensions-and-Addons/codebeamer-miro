import * as React from 'react';
import { createRoot } from 'react-dom/client';

import { Provider } from 'react-redux';
import { store } from './store/store';

import Content from './pages/content/Content';
import Toasts from './components/toasts/Toasts';
import BoardSettingsLoader from './components/boardSettingsLoader/BoardSettingsLoader';
import { logPageOpened } from './api/analytics.api';

function App() {
	//* manual resets for stored data. for testing purposes.
	React.useEffect(() => {
		logPageOpened('Item Import');
		// miro.board.setAppData('projectId', '');
		// miro.board.setAppData('cbAddress', '');
		// const config = {
		// 	standard: {},
		// 	trackerSpecific: [],
		// };
		// console.log(config);
		// miro.board.setAppData('cardTagConfiguration', config);
		// localStorage.clear();
		// sessionStorage.clear();
		// localStorage.removeItem(UserSetting.SHOW_ANNOUNCEMENTS);
	});

	return (
		<Provider store={store}>
			<BoardSettingsLoader>
				<Content />
			</BoardSettingsLoader>
			<Toasts />
		</Provider>
	);
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
