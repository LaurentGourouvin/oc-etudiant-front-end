describe('Security + Validation', () => {
  const user = {
    firstName: 'John',
    lastName: 'Doe',
    login: 'e2e_user',
    password: 'password',
  };

  const makeExpiredJwt = () => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 60 }),
    );
    const signature = 'sig';
    return `${header}.${payload}.${signature}`;
  };

  const login = () => {
    cy.request({
      method: 'POST',
      url: '/api/register',
      failOnStatusCode: false,
      body: user,
    });

    cy.visit('/login');
    cy.get('[data-cy="login-input"]').type(user.login);
    cy.get('[data-cy="password-input"]').type(user.password);
    cy.get('[data-cy="login-submit"]').click();
    cy.url().should('include', '/dashboard');
  };

  it('2.1 should redirect to /login when token is expired', () => {
    cy.on('window:alert', (txt) => {
      expect(txt).to.eq('Vous avez été déconnecté. Veuillez vous reconnecter.');
    });

    cy.visit('/login');

    cy.window().then((win) => {
      win.localStorage.setItem('auth_token', makeExpiredJwt());
    });

    cy.visit('/dashboard/student-list');
    cy.url().should('include', '/login');
  });

  it('2.2 should show validation errors and not call API when submitting empty form', () => {
    login();

    cy.visit('/dashboard/student-create');

    // Spy sur l'API create
    cy.intercept('POST', '/api/student').as('createStudent');

    // WHEN
    cy.get('[data-cy="student-create-submit"]').click();

    // THEN: aucune requête POST ne doit partir
    cy.wait(500);
    cy.get('@createStudent.all').should('have.length', 0);

    // THEN: on reste sur la page
    cy.url().should('include', '/dashboard/student-create');

    // THEN: erreurs visibles
    cy.contains('Le prénom est obligatoire').should('be.visible');
    cy.contains('Le nom est obligatoire').should('be.visible');
    cy.contains("L'email est obligatoire").should('be.visible');
  });
});
