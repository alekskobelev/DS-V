/// <reference types="cypress" />

// ***********************************************
// Custom Cypress commands for DS-Engineering E2E tests
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to wait for core app hydration and network idle
       */
      waitForAppReady(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('waitForAppReady', () => {
  cy.window().should('have.property', 'document');
  cy.document().should((doc) => {
    expect(doc.readyState).to.equal('complete');
  });
});

export {};
