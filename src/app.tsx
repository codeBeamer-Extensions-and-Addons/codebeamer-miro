import * as React from 'react';
import { createRoot } from 'react-dom/client';

import { Provider } from 'react-redux';
import { store } from './store/store';

import Content from './pages/content/Content';
import Toasts from './components/toasts/Toasts';

function App() {
	//* manual projectId reset because I haven't implemented it yet in the UI
	React.useEffect(() => {
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
	});

	return (
		<Provider store={store}>
			<Content />
			<Toasts />
		</Provider>
	);
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
