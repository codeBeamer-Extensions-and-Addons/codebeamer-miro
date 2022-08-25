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

	const standardProperties: string[] = Object.values(StandardItemProperty);

	return (
		<div>
			<div>
				<p className="muted-medium">
					Select the properties you want to be displayed as Tags on
					the imported Items' Cards.
				</p>
			</div>
			<div className="my-2">
				<div className="property">
					<label
						className="checkbox"
						title="Default property"
						data-test="defaultTag-summary"
					>
						<input type="checkbox" disabled checked />
						<span className="muted-medium">Summary</span>
					</label>
				</div>
				<div className="property">
					<label
						className="checkbox"
						data-test="defaultTag-description"
					>
						<input
							type="checkbox"
							title="Default property"
							disabled
							checked
						/>
						<span className="muted-medium">Description</span>
					</label>
				</div>
				<div className="property">
					<label
						className="checkbox"
						title="Default property"
						data-test="defaultTag-status"
					>
						<input type="checkbox" disabled checked />
						<span className="muted-medium">Status</span>
					</label>
				</div>
				{standardProperties.map((p) => (
					<div className="property">
						<label
							className="checkbox"
							data-test={`tag-${p.replace(' ', '-')}`}
						>
							<input
								type="checkbox"
								checked={cardTagConfiguration.standard[p]}
								onChange={() =>
									dispatch(
										setStandardCardTagConfiguration({
											property: p,
											value:
												!cardTagConfiguration.standard[
													p
												] ?? true,
										})
									)
								}
							/>
							<span>{p}</span>
						</label>
					</div>
				))}
			</div>
		</div>
	);
}
