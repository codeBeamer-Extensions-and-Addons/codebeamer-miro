import * as React from 'react';
import { createRoot } from 'react-dom/client';

import { Provider } from 'react-redux';
import { store } from './store/store';

import Toasts from './components/toasts/Toasts';
import ItemDetails from './pages/item/itemDetails';

function Item() {
	return (
		<Provider store={store}>
			<ItemDetails />
			<Toasts position="bottom-center" />
		</Provider>
	);
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<Item />);
