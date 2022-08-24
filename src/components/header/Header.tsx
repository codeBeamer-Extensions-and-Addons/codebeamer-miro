import * as React from 'react';

export default function Header(props: {
	centered?: boolean;
	margin?: boolean;
	children?: any;
}) {
	return (
		<header
			className={`${props.centered ? 'text-center' : ''} ${
				props.margin ? 'mb-5' : ''
			}`}
		>
			<h2 className="h2" data-test="header-container">
				{props.children}
			</h2>
		</header>
	);
}
