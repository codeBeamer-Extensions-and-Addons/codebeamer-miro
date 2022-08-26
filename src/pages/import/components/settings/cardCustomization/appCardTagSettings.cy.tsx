import React from 'react';
import { StandardItemProperty } from '../../../../../enums/standard-item-property.enum';
import { IAppCardTagSetting } from '../../../../../models/import-configuration.if';
import { setStandardCardTagConfiguration } from '../../../../../store/slices/boardSettingsSlice';
import { getStore } from '../../../../../store/store';
import AppCardTagSettings from './AppCardTagSettings';

describe('<AppCardTagSettings', () => {
	it('mounts', () => {
		cy.mountWithStore(<AppCardTagSettings />);
	});

	it('shows a disabled checkbox for each of the three default properties', () => {
		cy.mountWithStore(<AppCardTagSettings />);

		cy.getBySel('defaultTag-Summary')
			.find('input[type="checkbox"]')
			.should('be.disabled');
		cy.getBySel('defaultTag-Description')
			.find('input[type="checkbox"]')
			.should('be.disabled');
		cy.getBySel('defaultTag-Status')
			.find('input[type="checkbox"]')
			.should('be.disabled');
	});

	it('shows a checkbox for each value of the StandardItemProperty', () => {
		const standardProperties: string[] =
			Object.values(StandardItemProperty);

		cy.mountWithStore(<AppCardTagSettings />);

		standardProperties.forEach((p) => {
			cy.getBySel(`tag-${p.replace(' ', '-')}`)
				.find('input[type="checkbox"]')
				.should('exist');
		});
	});

	context('store / cache interface', () => {
		it('sets the inputs their "checked" value based on the cached cardTagConfiguration', () => {
			const testSettings: IAppCardTagSetting[] = [
				{
					property: 'ID',
					value: true,
				},
				{
					property: 'Story Points',
					value: true,
				},
				{
					property: 'Submitted By',
					value: true,
				},
				{
					property: 'Submitted At',
					value: false,
				},
			];

			const store = getStore();

			for (let i = 0; i < testSettings.length; i++) {
				store.dispatch(
					setStandardCardTagConfiguration(testSettings[i])
				);
			}

			cy.mountWithStore(<AppCardTagSettings />, { reduxStore: store });

			for (let i = 0; i < testSettings.length; i++) {
				cy.getBySel(`tag-${testSettings[i].property.replace(' ', '-')}`)
					.find('input[type="checkbox"]')
					.then((element) => {
						if (testSettings[i].value) {
							expect(element).to.be.checked;
						} else {
							expect(element).not.to.be.checked;
						}
					});
			}
		});

		it('updates the stored cardTagConfiguration when a value is (un-)checked', () => {
			const store = getStore();

			cy.spy(store, 'dispatch').as('dispatch');

			cy.mountWithStore(<AppCardTagSettings />, { reduxStore: store });

			cy.getBySel('tag-Owner').click();
			cy.get('@dispatch').then((spy) => {
				expect(spy).to.have.been.calledWith(
					setStandardCardTagConfiguration({
						property: 'Owner',
						value: true,
					})
				);
			});

			cy.wait(500);

			cy.getBySel('tag-Owner').click();
			cy.get('@dispatch').then((spy) => {
				expect(spy).to.have.been.calledWith(
					setStandardCardTagConfiguration({
						property: 'Owner',
						value: false,
					})
				);
			});
		});
	});

	afterEach(() => {
		localStorage.clear();
	});
});