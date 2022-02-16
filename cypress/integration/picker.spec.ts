/// <reference types="cypress" />

import { FilterCriteria, StandardItemProperty, LocalSetting } from '../../src/entities';

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
        
        //* RETINA-1565419
        it('has a button to load more search results with', () => {
            cy.get('#lazy-load-button');
        });
        
        //* RETINA-1565419
        it('hides the button to load more search results with by default', () => {
            cy.get('#lazy-load-button').should('have.attr', 'hidden');
        })

        it.skip('shows the Tracker Select by default', () => {
            cy.get('div#simpleSearch').should('have.class', 'visible');
            cy.get('div#advancedSearch').should('have.class', 'hidden');
        });

        context('simple search', () => {

            //* RETINA-1565422
            it('displays a button to add filter criteria', () => {
                cy.get('#simpleSearch').find('#add-filter');
            });

            //* RETINA-1565422
            it('disables the button to add filter criteria when no tracker is selected', () => {
                cy.get('#add-filter').should('have.attr', 'disabled');
            });
        });

        //* RETINA-1565413
        it('has a button, which opens the import configuration modal', () => {
            cy.get('#openImportConfiguration').click();
            cy.get('#importConfiguration').should('be.visible');
        });

        //* RETINA-1565413
        context('import configuration', () => {

            beforeEach(() => {
                cy.get('#openImportConfiguration').click();
            })

            it('has checkboxes to select standard item properties', () => {
                const standardProperties = Object.keys(StandardItemProperty).map((e) => {
                    return StandardItemProperty[e]
                });

                for(let i = 0; i < standardProperties.length; i++) {
                    cy.get('#standardProperties').find(`input[value="${standardProperties[i]}"]`)
                };
            });

            it('has a button, which closes the modal', () => {
                //wait for the animation
                cy.wait(1000);
                cy.get('#closeConfigurationModal').click();
                cy.get('#importConfiguration').should('not.be.visible');
            })
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
            
            cy.mockLogin();
            cy.visit('picker.html');

            //stub cb API calls to fixed responses and therefore static assertions
            //also allows to run tests without RCN connection
            cy.intercept('GET', 'https://retinatest.roche.com/cb/api/v3/projects/**/trackers', { fixture: 'trackers.json' });
            cy.intercept('POST', 'https://retinatest.roche.com/cb/api/v3/items/query', { fixture: 'trackerItems_page1.json' });
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

        describe('simple search', () => {

            //* RETINA-1565422
            it('has a button to switch between AND and OR chaining with AND as default for every criteria (but clicking it changes it for all of them)', () => {
                cy.get('select#selectedTracker').select('4877085');
                cy.get('#add-filter').click()

                cy.get('.chaining-label').first().should('have.text', 'AND');
                cy.get('.chaining-label').last().should('have.text', 'AND');

                cy.get('.chaining-label').first().click();

                cy.get('.chaining-label').first().should('have.text', 'OR');
                cy.get('.chaining-label').last().should('have.text', 'OR');
            });

            //* RETINA-1565422
            it('adds a filter input after clicking the button to add filter criteria', () => {
                cy.get('select#selectedTracker').select('4877085');
                cy.get('#add-filter').click()
                cy.get('.filter-criteria').find('.criteria').find('input');
            });

            //* RETINA-1565422
            it('allows to filter by standard criteria', () => {
                cy.get('select#selectedTracker').select('4877085');
                cy.get('#simpleSearch').find('#add-filter').click();

                const criteria = Object.keys(FilterCriteria).map(e => FilterCriteria[e]);

                for(let criterion of criteria) {
                    cy.get('#simpleSearch').find('.criteria').find('select').should('contain.html', criterion);
                }
            });
            
            //* RETINA-1565422
            it('filters the result table by the configured criteria when it\'s updated', () => {                
                cy.intercept('POST', 'https://retinatest.roche.com/cb/api/v3/items/query', []).as('query')
                
                cy.get('select#selectedTracker').select('4877085');
                const trackerQuery = "tracker.id IN (4877085)";
                cy.wait('@query').its('request.body.queryString').should('equal', trackerQuery);
                
                cy.get('#simpleSearch').find('#add-filter').click();
                cy.get('#simpleSearch').find('.filter-criteria input').first().type('Edelweiss').type('{enter}');
                const trackerAndOneCriterionQuery = "tracker.id IN (4877085) AND (teamName = 'Edelweiss')";
                cy.wait('@query').its('request.body.queryString').should('equal', trackerAndOneCriterionQuery);
                
                cy.get('#simpleSearch').find('#add-filter').click();
                cy.get('#simpleSearch').find('.filter-criteria input').last().type('Rover (Migration)').type('{enter}');
                const trackerAndTwoCriteriaQuery = "tracker.id IN (4877085) AND (teamName = 'Edelweiss' AND teamName = 'Rover (Migration)')";
                cy.wait('@query').its('request.body.queryString').should('equal', trackerAndTwoCriteriaQuery);
                
                
                // checks that the queryString in the resulting request is as expected
            });
        });

        describe('loading additional results', () => {

            //* RETINA-1565419
            it('enables the "load more results" button when there are more items that can be loaded for the selected criteria', () => {
                cy.get('select#selectedTracker').select('4877085');
                cy.get('#lazy-load-button').should('not.have.attr', 'disabled');
            });

            //* RETINA-1565419
            it('loads additional search results when clicking the "load more results" button and appends them to the results table', () => {
                cy.intercept('POST', 'https://retinatest.roche.com/cb/api/v3/items/query', { fixture: 'trackerItems_page2.json'}).as('query')

                cy.get('select#selectedTracker').select('4877085');
                cy.get('#lazy-load-button').click();

                //expect it to be called
                cy.wait('@query');

                //expect this element to have been appended to the table
                cy.get('input#1431175');
            })
        });

        describe('import configuration', () => {

            beforeEach(() => {
                cy.get('#openImportConfiguration').click();
            })

            //* RETINA-1565413
            it('saves the configuration in the board settings upon clicking the save button', () => {
                cy.get('#standardProperties').find(`input[value="${StandardItemProperty.TEAMS}"]`).check();
                cy.get('#standardProperties').find(`input[value="${StandardItemProperty.STORY_POINTS}"]`).check();
                cy.get('#standardProperties').find(`input[value="${StandardItemProperty.ASSIGNED_AT}"]`).check();

                cy.get('#standardProperties').find(`input[value="${StandardItemProperty.ASSIGNED_TO}"]`).check().uncheck();
                cy.get('#standardProperties').find(`input[value="${StandardItemProperty.END_DATE}"]`).check().uncheck().should(() => {
                    const testStoreSuffix = "e2e-test";
                    const boardSettings = JSON.parse(localStorage.getItem('codebeamer-miro-plugin-board-settings-' + testStoreSuffix) ?? "");

                    expect(boardSettings).to.have.property('importConfiguration');
                    const importConfiguration = boardSettings.importConfiguration;

                    expect(importConfiguration).to.have.property('standard')
                    const standardConfiguration = importConfiguration.standard;
    
                    expect(standardConfiguration[StandardItemProperty.TEAMS]).to.exist.and.to.be.true;
                    expect(standardConfiguration[StandardItemProperty.STORY_POINTS]).to.exist.and.to.be.true;
                    expect(standardConfiguration[StandardItemProperty.ASSIGNED_AT]).to.exist.and.to.be.true;
    
                    expect(standardConfiguration[StandardItemProperty.ASSIGNED_TO]).to.exist.and.to.be.false;
                    expect(standardConfiguration[StandardItemProperty.END_DATE]).to.exist.and.to.be.false;
                });

            });
        })

        describe('advanced search', () => {

            beforeEach(() => {
                const testStoreSuffix = "e2e-test";
                const localSettings = JSON.parse(localStorage.getItem('codebeamer-miro-plugin-board-settings-' + testStoreSuffix) ?? "");
                if(!localSettings[LocalSetting.ADVANCED_SEARCH_ENABLED]) {
                    cy.wait(1000);
                    cy.get('#switchSearchButton').click();
                };
            });
            
            //* RETINA-1565417
            it('imports all query results when clicking the "Import All" button after entering a query', () => {
                //fixture content doesn't matter
                cy.intercept('POST', 'https://retinatest.roche.com/cb/api/v3/items/query', { fixture: 'trackerItems_page2.json'}).as('query')

                const itemIds: string[] = [];
                for(let i = 0; i<10; i++) {
                    itemIds.push((100000 + (Math.random()*999999)).toString())
                }
                const queryIds = itemIds.join(',');
                const query = `item.id in (${queryIds})`;
                cy.get('#cbqlQuery').type(query + '{enter}');
                cy.wait(100);

                cy.get('#importAllButton').click();

                cy.wait('@query').its('request.body.queryString').should('include', query);
            });

        })
    });

    //since all the above tests within the 'dynamic elements' context need their beforehook, but this one doesn't work properly with it
    //this alternative context was created
    //refactor as needed when more tests come in
    context('dynamic elements without before-hook', () => {
        //* RETINA-1565415
        it.only('does not display items of category Folder or Information in the results table', () => {            
            cy.intercept('POST', 'https://retinatest.roche.com/cb/api/v3/items/query', { fixture: 'trackerItems_with_categories' }).as('query');
            
            cy.mockLogin();

            cy.visit('picker.html');
            cy.get('select#selectedTracker').select('4877085');
            cy.wait('@query');

            //Folders
            cy.get('input#1482773').should('not.exist');
            cy.get('input#1482743').should('not.exist');
            //Information
            cy.get('input#1438657').should('not.exist');
            //Information and Folder
            cy.get('input#1438622').should('not.exist');

            //regular item
            cy.get('input#1431188').should('exist');
        });
    });

})