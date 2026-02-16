describe('Auth - Login', () => {
  const user = {
    firstName: 'John',
    lastName: 'Doe',
    login: 'e2e_user',
    password: 'password',
  };

  beforeEach(() => {
    cy.clearLocalStorage();
    cy.request({
      method: 'POST',
      url: '/api/register',
      failOnStatusCode: false,
      body: user,
    });

    cy.visit('/login');
  });

  it('0.1 should login successfully and redirect to dashboard + store token', () => {
    cy.get('[data-cy="login-input"]').type(user.login);
    cy.get('[data-cy="password-input"]').type(user.password);

    cy.get('[data-cy="login-submit"]').click();

    cy.url().should('include', '/dashboard');

    cy.window().then((win) => {
      const token = win.localStorage.getItem('auth_token');
      expect(token).to.be.a('string').and.not.be.empty;
    });
  });

  it('0.2 should show error message with wrong credentials', () => {
    cy.get('[data-cy="login-input"]').type(user.login);
    cy.get('[data-cy="password-input"]').type('wrong_password');

    cy.get('[data-cy="login-submit"]').click();

    cy.url().should('include', '/login');

    cy.get('[data-cy="login-error"]').should('be.visible');

    cy.window().then((win) => {
      expect(win.localStorage.getItem('auth_token')).to.be.null;
    });
  });

  it('0.3 should redirect to /login when accessing a protected route without token', () => {
    cy.clearLocalStorage();

    cy.on('window:alert', (txt) => {
      expect(txt).to.contain(
        'Vous avez été déconnecté. Veuillez vous reconnecter.',
      );
    });

    // Tente d’accéder à une route protégée
    cy.visit('/dashboard/student-list');

    // attendu : redirection login
    cy.url().should('include', '/login');

    cy.window().then((win) => {
      expect(win.localStorage.getItem('auth_token')).to.be.null;
    });
  });
});
