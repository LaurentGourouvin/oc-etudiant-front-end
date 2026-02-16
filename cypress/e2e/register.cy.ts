describe('Auth - Register', () => {
  const uniqueLogin = () => `e2e_user_${Date.now()}`;

  const user = () => ({
    firstName: 'John',
    lastName: 'Doe',
    login: uniqueLogin(),
    password: 'password',
  });

  beforeEach(() => {
    cy.visit('/register');
  });

  it('0.1 should register successfully and show success alert', () => {
    const u = user();

    // Intercepte l’alert pour éviter que Cypress bloque / flake
    cy.on('window:alert', (text) => {
      expect(text).to.contain('SUCCESS');
    });

    cy.get('[data-cy="register-firstName"]').type(u.firstName);
    cy.get('[data-cy="register-lastName"]').type(u.lastName);
    cy.get('[data-cy="register-login"]').type(u.login);
    cy.get('[data-cy="register-password"]').type(u.password);

    cy.get('[data-cy="register-submit"]').click();

    // Comme ton code ne navigue pas encore vers /login,
    // on valide le comportement actuel : succès + on reste sur /register
    cy.url().should('include', '/register');
  });

  it('0.2 should show validation errors when submitting empty form', () => {
    cy.get('[data-cy="register-submit"]').click();

    // erreurs visibles (le message exact dépend de ton template)
    cy.get('[data-cy="register-firstName-required"]').should('be.visible');
    cy.get('[data-cy="register-lastName-required"]').should('be.visible');
    cy.get('[data-cy="register-login-required"]').should('be.visible');
    cy.get('[data-cy="register-password-required"]').should('be.visible');

    cy.url().should('include', '/register');
  });

  it('0.3 should reset form when clicking cancel', () => {
    cy.get('[data-cy="register-firstName"]').type('A');
    cy.get('[data-cy="register-lastName"]').type('B');
    cy.get('[data-cy="register-login"]').type('C');
    cy.get('[data-cy="register-password"]').type('D');

    cy.get('[data-cy="register-cancel"]').click();

    cy.get('[data-cy="register-firstName"]').should('have.value', '');
    cy.get('[data-cy="register-lastName"]').should('have.value', '');
    cy.get('[data-cy="register-login"]').should('have.value', '');
    cy.get('[data-cy="register-password"]').should('have.value', '');
  });
});
