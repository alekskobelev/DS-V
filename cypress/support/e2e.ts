// ***********************************************************
// This support file is processed and loaded automatically
// before your E2E test files.
// ***********************************************************

import './commands';

// Ignore non-fatal third-party and WebGL/ResizeObserver errors
Cypress.on('uncaught:exception', (err) => {
  if (
    err.message.includes('ResizeObserver loop') ||
    err.message.includes('Script error.') ||
    err.message.includes('Non-Error promise rejection') ||
    err.message.includes('WebGL') ||
    err.message.includes('THREE')
  ) {
    // Returning false here prevents Cypress from failing the test
    return false;
  }
  return true;
});
