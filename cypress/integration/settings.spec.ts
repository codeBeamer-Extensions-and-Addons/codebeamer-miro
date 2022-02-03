/// <reference types="cypress" />

import Store from '../../src/services/store';

/**
 * Test specification for the settings.html site and its respective script.
 */
describe('Settings & Login site', () => {

    //suppress show(Error)Notification not defined warnings
    //miro SDK doesn't initialize the window.miro object since the testing env is not an a board
    //so all miro functions aren't defined
    Cypress.on('uncaught:exception', (err, runnable) => {
        if (err.message.includes('showErrorNotification is not a function')) {
            return false;
        }
        if (err.message.includes('showNotification is not a function')) {
            return false;
        }
    });

    beforeEach(() => {
        cy.visit('settings.html');

        // ? from ways... { lang: 'de-CH' }
        // const fakeClientId = (100000 + (Math.random()*999999)).toString();
        // const fakeBoardId = (100000 + (Math.random()*999999)).toString();
        // Store.create(fakeClientId, fakeBoardId);
    })

    it('has a working codeBeamer adress input', () => {
        cy.get('input#cbAddress').clear().type('retina').should('have.value', 'retina');
    })

    it('has a working Project ID or Key input', () => {
        cy.get('input#projectId').clear().type('907').should('have.value', '907');
    })

    it('has a working Inbox Tracker ID input', () => {
        cy.get('input#inboxTrackerId').clear().type('4877085').should('have.value', '4877085');
    })

    it('has a working username input', () => {
        cy.get('input#cbUsername').clear().type('urecha').should('have.value', 'urecha');
    })

    it('has a working password field', () => {
        cy.get('input#cbPassword').clear().type('s!ckP4s$w0Rd').should('have.value', 's!ckP4s$w0Rd');
    })

    it('has the save button', () => {
        cy.get('button#saveButton');
    })

    it('can authenticate successfully', () => {
        cy.get('input#cbAddress').clear().type('https://retinatest.roche.com/cb');
        cy.get('input#projectId').clear().type('907');
        cy.get('input#cbUsername').clear().type(Cypress.env('cbUsername'));
        cy.get('input#cbPassword').clear().type(Cypress.env('cbPassword'));

        cy.intercept({
            method: 'GET',
            url: 'https://retinatest.roche.com/cb/api/v3/users/**'
        }).as('findUser')

        cy.get('button#saveButton').click();

        cy.wait('@findUser').then((interception) => {
            assert.equal(interception.response?.statusCode, 200, 'findUser response successfull');
        });
    });

    it('stores config values in localstorage when clicking the Save button', () => {
        const testStoreSuffix = "e2e-test";

        let cbAddress = 'test';
        let projectId = '99';
        let inboxTrackerId = '';
        let username = 'test-user';
        let password = 'test-password';
        
        cy.on('uncaught:exception', (err, runnable) => {
            //the url we provide will be invalid, but we don't care about it
            if (err.message.includes("Failed to construct 'URL'")) {
                return false;
            }
        });

        //intercept the auth request and stub it to return nothing, since we don't care
        cy.intercept({
            method: 'GET',
            url: 'https://retinatest.roche.com/cb/api/v3/users/**'
        }, {});

        cy.get('input#cbAddress').clear().type(cbAddress);
        cy.get('input#projectId').clear().type(projectId);
        cy.get('input#cbUsername').clear().type(username);
        cy.get('input#cbPassword').clear().type(password);

        cy.get('button#saveButton').click().should(() => {
            const boardSettings = JSON.parse(localStorage.getItem('codebeamer-miro-plugin-board-settings-' + testStoreSuffix) ?? "");
            expect(boardSettings).not.to.equal(null);
            expect(boardSettings.cbAddress).to.equal(cbAddress);
            expect(boardSettings.inboxTrackerId).to.equal(inboxTrackerId);
            expect(boardSettings.projectId).to.equal(projectId);
            
            const userSettings = JSON.parse(localStorage.getItem('codebeamer-miro-plugin-' + testStoreSuffix) ?? "");
            expect(userSettings).not.to.equal(null);
            expect(userSettings.cbUsername).to.equal(username);
            
            const sessionSettings = JSON.parse(sessionStorage.getItem('codebeamer-miro-plugin-' + testStoreSuffix) ?? "");
            expect(sessionSettings).not.to.equal(null);
            expect(sessionSettings.cbPassword).to.equal(password);
        });
    })
});