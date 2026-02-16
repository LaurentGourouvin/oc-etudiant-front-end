describe('StudentUpdate - Errors', () => {
  const id = 123;

  const student = {
    id,
    firstName: 'Ana',
    lastName: 'Kim',
    email: 'ana@ex.com',
    created_at: '2026-02-16',
    updated_at: '2026-02-16',
  };

  // Helper: inject token "valide"
  const setValidJwt = () => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 60 * 30 }),
    );
    const signature = 'sig';
    cy.window().then((win) => {
      win.localStorage.setItem(
        'auth_token',
        `${header}.${payload}.${signature}`,
      );
    });
  };

  beforeEach(() => {
    cy.visit('/login');
    setValidJwt();
  });

  it('should handle GET /api/student/:id 401 by alerting and redirecting to /login', () => {
    cy.intercept('GET', `**/api/student/${id}`, { statusCode: 401 }).as(
      'getStudent401',
    );

    const alertStub = cy.stub();
    cy.on('window:alert', alertStub);

    cy.visit(`/dashboard/student/${id}/update`);
    cy.wait('@getStudent401');

    cy.url().should('include', '/login');
    cy.wrap(alertStub).should(
      'have.been.calledWith',
      'Vous avez été déconnecté. Veuillez vous reconnecter.',
    );
  });

  it('should handle GET /api/student/:id non-401 by showing "Aucun étudiant correspondant trouvé."', () => {
    cy.intercept('GET', `**/api/student/${id}`, { statusCode: 404 }).as(
      'getStudent404',
    );

    cy.visit(`/dashboard/student/${id}/update`);
    cy.wait('@getStudent404');

    cy.get('[data-cy="student-update-api-error"]')
      .should('be.visible')
      .and('contain', 'Aucun étudiant correspondant trouvé.');
  });

  it('should handle PUT /api/student/:id 401 by alerting and redirecting to /login', () => {
    // GET OK pour pré-remplir
    cy.intercept('GET', `**/api/student/${id}`, {
      statusCode: 200,
      body: student,
    }).as('getStudent');

    // PUT 401
    cy.intercept('PUT', `**/api/student/${id}`, { statusCode: 401 }).as(
      'putStudent401',
    );

    const alertStub = cy.stub();
    cy.on('window:alert', alertStub);

    cy.visit(`/dashboard/student/${id}/update`);
    cy.wait('@getStudent');

    // rendre le form valide
    cy.get('[data-cy="student-update-firstName"]').clear().type('New');
    cy.get('[data-cy="student-update-lastName"]').clear().type('Name');
    cy.get('[data-cy="student-update-email"]')
      .clear()
      .type(`new.${Date.now()}@ex.com`);

    cy.get('[data-cy="student-update-submit"]').click();

    cy.wait('@putStudent401');
    cy.url().should('include', '/login');

    cy.wrap(alertStub).should(
      'have.been.calledWith',
      'Vous avez été déconnecté. Veuillez vous reconnecter.',
    );
  });

  it('should handle PUT /api/student/:id non-401 by showing "Erreur lors de la mise à jour de l\'étudiant."', () => {
    // GET OK pour pré-remplir
    cy.intercept('GET', `**/api/student/${id}`, {
      statusCode: 200,
      body: student,
    }).as('getStudent');

    // PUT 400 (ou 500)
    cy.intercept('PUT', `**/api/student/${id}`, {
      statusCode: 400,
      body: { message: 'Bad request' },
    }).as('putStudent400');

    cy.visit(`/dashboard/student/${id}/update`);
    cy.wait('@getStudent');

    cy.get('[data-cy="student-update-firstName"]').clear().type('New');
    cy.get('[data-cy="student-update-lastName"]').clear().type('Name');
    cy.get('[data-cy="student-update-email"]')
      .clear()
      .type(`new.${Date.now()}@ex.com`);

    cy.get('[data-cy="student-update-submit"]').click();

    cy.wait('@putStudent400');

    cy.get('[data-cy="student-update-api-error"]')
      .should('be.visible')
      .and('contain', "Erreur lors de la mise à jour de l'étudiant.");
  });
});
