// ***********************************************
// For comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

/**
 * This mocks logging in, meaning the actual HTTP request verifying the connection is valid is stubbed.
 * <p>
 * This works if all subsequent requests in tests using this command are stubbed too.
 * It's still necessary to perform the steps in this method to store the plugin config values, which will be reused.
 * </p>
 */
Cypress.Commands.add('mockLogin', () => {
    cy.visit('settings.html');

    cy.on('uncaught:exception', (err, runnable) => {
        if (err.message.includes('showErrorNotification is not a function')) {
            return false;
        }
        if (err.message.includes('showNotification is not a function')) {
            return false;
        }
    });

    cy.get('input#cbAddress').clear().type(Cypress.env("retinaBaseUrl"));
    cy.get('input#projectId').clear().type('907');
    cy.get('input#cbUsername').clear().type(Cypress.env('cbUsername'));
    cy.get('input#cbPassword').clear().type(Cypress.env('cbPassword'));

    cy.intercept({
        method: 'GET',
        url: 'https://retinatest.roche.com/cb/api/v3/users/**'
    }, { id: 1 }).as('findUser')

    cy.get('button#saveButton').click();
})