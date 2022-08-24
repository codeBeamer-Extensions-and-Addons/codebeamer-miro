import React from 'react';

export default function TabHeader(props: {
	title: string;
	active?: boolean;
	dataBadge?: number;
	icon?: string;
}) {
	return (
		<div
			tabIndex={0}
			className={`tab ${props.active ? 'tab-active' : ''}`}
			data-test="wrapper"
		>
			<div
				className="tab-text tab-badge"
				data-badge={props.dataBadge ?? ''}
				data-test="content"
			>
				{props.icon && (
					<span
						className={`clickable icon icon-${props.icon}`}
						data-test="icon"
					>
						{' '}
					</span>
				)}
				{props.title}
			</div>
		</div>
	);
}
