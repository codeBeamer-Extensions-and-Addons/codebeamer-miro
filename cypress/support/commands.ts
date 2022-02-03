// ***********************************************
// For comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

Cypress.Commands.add('login', () => {
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
        }).as('findUser')

        cy.get('button#saveButton').click();

        cy.wait('@findUser').then((interception) => {
            assert.isNotNull(interception.response?.body.id, 'findUser response successfull');
        });
})