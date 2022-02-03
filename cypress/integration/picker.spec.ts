/// <reference types="cypress" />

/**
 * Test specification for the picker.html site and its respective script.
 */
describe('Picker', () => {

    Cypress.on('uncaught:exception', (err, runnable) => {
        if (err.message.includes('showErrorNotification is not a function')) {
            return false;
        }
        if (err.message.includes('showNotification is not a function')) {
            return false;
        }
    })
    
    context('static elements', () => {

        beforeEach(() => {
            cy.visit('picker.html');
            cy.on('uncaught:exception', (err, runnable) => {
                //the url we provide will be false, but we don't care about it
                if (err.message.includes("Failed to construct 'URL'")) {
                    return false;
                }
            });
        });

        it('has an import button', () => {
            cy.get('button#importButton');
        });
    
        it('has an update button', () => {
            cy.get('button#synchButton');
        });
    
        it.skip('shows the Tracker Select by default', () => {
            cy.get('div#simpleSearch').should('have.class', 'visible');
            cy.get('div#advancedSearch').should('have.class', 'hidden');
        });

        it('displays two pagination controls for the data table', () => {
            cy.get('div#dataTable-controls').find('button').should('have.length', 2);
        });

    });
    
    context('dynamic elements', () => {

        beforeEach(() => {

            cy.on('uncaught:exception', (err, runnable) => {
                // * miro.anything will be undefined, so this is ignored
                // * unfortunately, the error msg doesn't specify miro, so all errors of that
                // * kind will be ignored, which weakens the testing result slightly.
                // * only slightly, because this is an e2e test, not a unit test.
                if (err.message.includes("Cannot read properties of undefined")) {
                    return false;
                }
            });
            
            cy.login();
            cy.visit('picker.html');

            //stub cb API calls to fixed responses and therefore static assertions
            //also allows to run tests without RCN connection
            cy.intercept('GET', 'https://retinatest.roche.com/cb/api/v3/projects/**/trackers', { fixture: 'trackers.json' });
            cy.intercept('POST', 'https://retinatest.roche.com/cb/api/v3/items/query', { fixture: 'trackerItems_page1.json' });
            //cy.intercept('POST', 'https://retinatest.roche.com/cb/api/v3/items/query?page=2&pageSize=13&queryString=tracker.id*', { fixture: 'trackerItems_page2.json' });
        });

        it('disables the import button by default', () => {
            cy.get('button#importButton').should('have.attr', 'disabled');
        });

        //requires the selected Project to have trackers (select has 1 option when it's empty, so we expect > 1 (which there are in the fixture))
        it('shows Trackers in the Tracker Select-select', () => {
            cy.get('select#selectedTracker').find('option').should(($options) => {
                expect($options.length).to.be.greaterThan(1);
            });
        });
    
        //requires the selected project to be 907 on retinatest
        it('shows the "Miro sync test by urecha" Tracker as an option', () => {
            cy.get('select#selectedTracker').find('option[value=\"4877085\"]').contains('Miro sync test by urecha');
        });
    
        it('displays a table of Items when selecting a Tracker with items in it', () => {
            cy.get('select#selectedTracker').select('4877085');
    
            cy.get('div#table-container').should('have.descendants', 'tr').should('have.descendants', 'td');
        });

        it('displays a select-all checkbox to select all items on a table-page when a Tracker is selected', () => {
            cy.get('select#selectedTracker').select('4877085');
    
            cy.get('input#checkAll');
        });
        
        it('enables the import button when an item is checked', () => {
            cy.get('select#selectedTracker').select('4877085');
    
            cy.get('input#1482773').parent().click();
    
            cy.get('button#importButton').should('not.have.attr', 'disabled');
        });
    
        it('displays the amount of items to import on the import button', () => {
            cy.get('select#selectedTracker').select('4877085');
    
            cy.get('input#1482773').parent().click();
            cy.get('input#1482743').parent().click();
            cy.get('input#1438657').parent().click();
    
            cy.get('button#importButton').contains('(3)');
        });

    });

})