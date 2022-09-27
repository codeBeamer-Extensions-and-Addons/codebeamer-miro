import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StandardItemProperty } from '../../../../../enums/standard-item-property.enum';
import { setStandardCardTagConfiguration } from '../../../../../store/slices/boardSettingsSlice';
import { RootState } from '../../../../../store/store';

import './appCardTagSettings.css';

export default function AppCardTagSettings() {
	const dispatch = useDispatch();

	const { cardTagConfiguration } = useSelector(
		(state: RootState) => state.boardSettings
	);

	const defaultTags: string[] = ['Summary', 'Description', 'Status'];

	const standardProperties: string[] = Object.values(StandardItemProperty);

	const generateStandardPropJSX = (prop: string) => {
		return (
			<div className="property" key={prop}>
				<label
					className="checkbox"
					data-test={`tag-${prop.replace(' ', '-')}`}
				>
					<input
						type="checkbox"
						checked={cardTagConfiguration.standard[prop] ?? false}
						onChange={() =>
							dispatch(
								setStandardCardTagConfiguration({
									property: prop,
									value:
										!cardTagConfiguration.standard[prop] ??
										true,
								})
							)
						}
					/>
					<span>{prop}</span>
				</label>
			</div>
		);
	};

	return (
		<div>
			<div>
				<p className="muted-medium">
					Select the properties you want to be displayed as Tags on
					the imported Items' Cards.
				</p>
			</div>
			<div className="my-2 grid">
				<div className="cs1 ce6 border-right-light">
					{defaultTags.map((dt) => (
						<div className="property" key={dt}>
							<label
								className="checkbox"
								title="Default property"
								data-test={`defaultTag-${dt}`}
							>
								<input type="checkbox" disabled checked />
								<span className="muted-medium">{dt}</span>
							</label>
						</div>
					))}
					{standardProperties
						.filter((p, i) => i % 2 == 1)
						.map((p) => generateStandardPropJSX(p))}
				</div>
				<div className="cs7 ce12">
					{standardProperties
						.filter((p, i) => i % 2 == 0)
						.map((p) => generateStandardPropJSX(p))}
				</div>
			</div>
		</div>
	);
}
