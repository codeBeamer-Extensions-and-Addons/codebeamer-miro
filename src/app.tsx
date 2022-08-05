import * as React from 'react';
import { createRoot } from 'react-dom/client';

import { Provider } from 'react-redux';
import { store } from './store/store';

import Content from './components/content';

function App() {
	return (
		<Provider store={store}>
			<Content />
		</Provider>
	);
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
