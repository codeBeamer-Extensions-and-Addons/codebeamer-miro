import * as React from 'react';

export default function Header(props: { centered?: boolean; children?: any }) {
	return (
		<header className={props.centered ? 'text-center' : ''}>
			<h1>{props.children}</h1>
		</header>
	);
}
