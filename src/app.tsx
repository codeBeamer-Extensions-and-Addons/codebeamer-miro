import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import { store } from './store/store';

import AuthForm from './components/auth';

// async function addSticky() {
// const stickyNote = await miro.board.createStickyNote({
// 	content: 'Hello there.',
// });

// await miro.board.viewport.zoomTo(stickyNote);
// }

function App() {
	const [connected, setConnected] = React.useState(false);

	React.useEffect(() => {
		//addSticky();
		//TODO check cb connection
		setConnected(false);
	}, []);

	if (!connected) {
		return (
			<Provider store={store}>
				<AuthForm />
			</Provider>
		);
	} else {
		return (
			<Provider store={store}>
				<div className="grid wrapper">
					<div className="cs1 ce12">Sup</div>
				</div>
			</Provider>
		);
	}
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
