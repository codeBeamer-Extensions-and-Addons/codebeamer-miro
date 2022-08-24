import React, { useState } from 'react';
import TabHeader from './tabHeader/TabHeader';

/**
 * Defines structure of a Tab entity that the {@link Tabs} component can render (an array of).
 */
export interface ITab {
	/**
	 * Title of the tab, will be displayed as the tab-headers
	 */
	title: string;
	/**
	 * Icon to display next to the title.
	 * !Currently not rendering properly. Usage is not advised.
	 */
	icon?: string;
	/**
	 * Optional dataBadge used to display a number next to the title.
	 */
	dataBadge?: string;
	/**
	 * The tab's content.
	 */
	tab: JSX.Element;
}

/**
 * Overcomplicated generic component using the miro tabs styling and retro-fitting it
 * with logic to work as expected.
 * @param props Takes an array of {@link ITab}s to render and an Optional index for the initially selected tab.
 */
export default function Tabs(props: {
	tabs: ITab[];
	initiallySelectedIndex?: number;
}) {
	const [activeTab, setActiveTab] = useState(
		props.initiallySelectedIndex ?? 0
	);

	const openTab = (index: number) => {
		setActiveTab(index);
	};

	const tabWidths = {
		width: (1 / props.tabs.length) * 100 + '%',
	};

	return (
		<>
			<div className="tabs">
				<div className="tabs-header-list">
					{props.tabs.map((t, index) => (
						<div
							key={index}
							onClick={() => openTab(index)}
							style={tabWidths}
							data-test={`tab-header-${index}`}
						>
							<TabHeader
								title={t.title}
								icon={t.icon}
								active={activeTab === index}
							/>
						</div>
					))}
				</div>
			</div>
			<div className="tab-content my-2" data-test="tab-content">
				{props.tabs[activeTab].tab}
			</div>
		</>
	);
}
