import * as React from 'react';
import AuthForm from './components/auth';
import { createRoot } from 'react-dom/client';

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
		return <AuthForm />;
	} else {
		return (
			<>
				<div className="grid wrapper">
					<div className="cs1 ce12">Sup</div>
				</div>
			</>
		);
	}
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
