import * as React from 'react';
import { createRoot } from 'react-dom/client';

import { Provider, useDispatch } from 'react-redux';
import { store } from './store/store';

import Toasts from './components/toasts/Toasts';
import ItemDetails from './pages/item/itemDetails';
import AuthForm from './pages/auth/auth';
import { useState } from 'react';
import { useIsAuthenticated } from './hooks/useIsAuthenticated';
import BoardSettingsLoader from './components/boardSettingsLoader/BoardSettingsLoader';

function Item(props: {
	itemId?: string; //optional prop for testing purposes
	cardId?: string; //optional prop for testing purposes
}) {
	const dispatch = useDispatch();

	const [itemId] = useState<string>(
		props.itemId ??
			new URL(document.location.href).searchParams.get('itemId') ??
			''
	);
	const [cardId] = useState<string>(
		props.cardId ??
			new URL(document.location.href).searchParams.get('cardId') ??
			''
	);
	const [fatalError, setFatalError] = useState<JSX.Element | null>(null);

	const [isAuthenticated, isAuthenticating] = useIsAuthenticated();

	React.useEffect(() => {
		if (!itemId || !cardId) {
			console.error(
				'Item page called without itemId and/or cardId in query.'
			);
			setFatalError(
				<div className="centered">
					<p>Something went wrong when opening the card details</p>
					<p>Please contact support</p>
				</div>
			);
			return;
		}
	}, []);

	if (fatalError) {
		return fatalError;
	} else if (isAuthenticating) {
		return <div className="centered loading-spinner-lg"></div>;
	} else if (!isAuthenticated) {
		return <AuthForm />;
	} else
		return (
			<>
				<ItemDetails cardId={cardId} itemId={itemId} />
				<Toasts position="bottom-center" />
			</>
		);
}

function Wrapper() {
	return (
		<Provider store={store}>
			<BoardSettingsLoader showAuthWhileLoading={false}>
				<Item />
			</BoardSettingsLoader>
		</Provider>
	);
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<Wrapper />);
