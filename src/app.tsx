import * as React from 'react';
import { createRoot } from 'react-dom/client';

import { Provider } from 'react-redux';
import { store } from './store/store';

import Content from './pages/content/Content';

function App() {
	//manual projectId reset because I haven't implemented it yet in the UI
	// React.useEffect(() => {
	// 	miro.board.setAppData('projectId', '');
	// 	miro.board.setAppData('cbAddress', '');
	// });

	return (
		<Provider store={store}>
			<Content />
		</Provider>
	);
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
