import * as React from 'react';

export default function Header(props: { centered?: boolean; children?: any }) {
	return (
		<header className={props.centered ? 'text-center' : ''}>
			<h1 className="h1" data-test="header-container">
				{props.children}
			</h1>
		</header>
	);
}
