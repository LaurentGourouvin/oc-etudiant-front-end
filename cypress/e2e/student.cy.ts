describe('Students - CRUD', () => {
  const user = {
    firstName: 'John',
    lastName: 'Doe',
    login: `e2e_user_${Date.now()}`,
    password: 'password',
  };

  const uniqueEmail = () => `ana.${Date.now()}@ex.com`;

  const getToken = () =>
    cy.window().then((win) => {
      const token = win.localStorage.getItem('auth_token');
      expect(token).to.be.a('string').and.not.be.empty;
      return token as string;
    });

  const loginUI = () => {
    cy.visit('/login');

    cy.get('[data-cy="login-input"]').type(user.login);
    cy.get('[data-cy="password-input"]').type(user.password);

    cy.get('[data-cy="login-submit"]').click();

    cy.url().should('include', '/dashboard');
    getToken();
  };

  const apiCreateStudent = (student: {
    firstName: string;
    lastName: string;
    email: string;
  }) =>
    getToken().then((token) =>
      cy.request({
        method: 'POST',
        url: '/api/student',
        headers: { Authorization: `Bearer ${token}` },
        body: student,
      }),
    );

  const apiGetAllStudents = () =>
    getToken().then((token) =>
      cy.request({
        method: 'GET',
        url: '/api/student',
        headers: { Authorization: `Bearer ${token}` },
      }),
    );

  const apiFindStudentIdByEmail = (email: string) =>
    apiGetAllStudents().then((res) => {
      const list = res.body as Array<any>;
      const found = list.find((s) => s.email === email);
      expect(found, `student with email ${email} should exist`).to.exist;
      expect(found.id).to.exist;
      return found.id as number;
    });

  beforeEach(() => {
    cy.clearLocalStorage();

    cy.request({
      method: 'POST',
      url: '/api/register',
      failOnStatusCode: false,
      body: user,
    });

    loginUI();
  });

  it('1.1 should create a student and show it in the list', () => {
    const email = uniqueEmail();

    cy.visit('/dashboard');

    cy.get('[data-cy="student-firstName"]').type('Ana');
    cy.get('[data-cy="student-lastName"]').type('Kim');
    cy.get('[data-cy="student-email"]').type(email);

    cy.get('[data-cy="student-create-submit"]').click();

    cy.url().should('include', '/dashboard/student-list');

    cy.contains('td', email).should('be.visible');
    cy.contains('td', 'Ana').should('be.visible');
    cy.contains('td', 'Kim').should('be.visible');
  });

  it('1.2.0 should open student detail from list', () => {
    const email = uniqueEmail();
    apiCreateStudent({ firstName: 'Ana', lastName: 'Kim', email });

    cy.visit('/dashboard/student-list');

    cy.contains('tr', email).within(() => {
      cy.get('[data-cy="student-view"]').click();
    });

    cy.url().should('include', '/detail');

    // page detail
    cy.get('[data-cy="student-detail"]').should('be.visible');
    cy.contains(email).should('be.visible');
  });

  it('1.2.1 should navigate back to list and to update from detail', () => {
    const email = uniqueEmail();
    apiCreateStudent({ firstName: 'Ana', lastName: 'Kim', email });

    apiFindStudentIdByEmail(email).then((id) => {
      // Aller sur la page détail (route avec l'id)
      cy.visit(`/dashboard/student/${id}/detail`);

      cy.get('[data-cy="student-detail"]').should('be.visible');
      cy.contains(email).should('be.visible');

      // Test goBack()
      cy.get('[data-cy="student-detail-back"]').click();
      cy.url().should('include', '/dashboard/student-list');

      // Revenir au détail pour tester goUpdateView()
      cy.visit(`/dashboard/student/${id}/detail`);

      // Test goUpdateView()
      cy.get('[data-cy="student-detail-update"]').click();
      cy.url().should('include', `/dashboard/student/${id}/update`);
      cy.get('[data-cy="student-update-submit"]').should('be.visible');
    });
  });

  it('1.2.3 should navigate to delete view when clicking delete button from list', () => {
    const student = {
      id: 123,
      firstName: 'Ana',
      lastName: 'Kim',
      email: `ana.${Date.now()}@ex.com`,
    };

    // Stub la liste pour maîtriser l'id
    cy.intercept('GET', '/api/student', {
      statusCode: 200,
      body: [student],
    }).as('getStudents');

    cy.visit('/dashboard/student-list');
    cy.wait('@getStudents');

    // Clique sur "Supprimer" de la ligne
    cy.get('[data-cy="student-row"]').should('have.length', 1);
    cy.get('[data-cy="student-row"]')
      .first()
      .within(() => {
        cy.get('[data-cy="student-delete"]').click();
      });

    // Attendu : navigation vers /dashboard/student/:id/delete
    cy.url().should('include', `/dashboard/student/${student.id}/delete`);
  });

  it('1.3 should update a student', () => {
    const email = uniqueEmail();
    apiCreateStudent({ firstName: 'Ana', lastName: 'Kim', email });

    apiFindStudentIdByEmail(email).then((id) => {
      const newEmail = `new.${Date.now()}@ex.com`;

      cy.visit(`/dashboard/student/${id}/update`);

      cy.get('[data-cy="student-update-firstName"]').clear().type('New');
      cy.get('[data-cy="student-update-lastName"]').clear().type('Name');
      cy.get('[data-cy="student-update-email"]').clear().type(newEmail);

      cy.get('[data-cy="student-update-submit"]').click();

      cy.url().should('include', `/dashboard/student/${id}/detail`);

      cy.get('[data-cy="student-detail"]').should('be.visible');
      cy.contains('New').should('be.visible');
      cy.contains('Name').should('be.visible');
      cy.contains(newEmail).should('be.visible');
    });
  });

  it('1.4 should delete a student', () => {
    const email = uniqueEmail();
    apiCreateStudent({ firstName: 'Ana', lastName: 'Kim', email });

    apiFindStudentIdByEmail(email).then((id) => {
      cy.visit(`/dashboard/student/${id}/delete`);

      cy.on('window:alert', () => {});

      cy.get('[data-cy="student-delete-confirm"]').click();

      cy.url().should('include', '/dashboard/student-list');
      cy.contains(email).should('not.exist');
    });
  });

  it('StudentList should show empty state when API returns empty list', () => {
    cy.intercept('GET', '**/api/student', {
      statusCode: 200,
      body: [],
    }).as('getStudentsEmpty');

    cy.visit('/dashboard/student-list');
    cy.wait('@getStudentsEmpty');

    cy.get('[data-cy="student-row"]').should('have.length', 0);

    cy.contains('Aucun étudiant trouvé.').should('be.visible');
  });

  it('StudentList should handle non-401 error and show error message', () => {
    cy.intercept('GET', '**/api/student', {
      statusCode: 500,
      body: { message: 'Boom' },
    }).as('getStudents500');

    cy.visit('/dashboard/student-list');
    cy.wait('@getStudents500');

    cy.contains('Aucun étudiant trouvé.').should('be.visible');
  });

  it('StudentList should handle 401 by alerting and redirecting to /login', () => {
    cy.intercept('GET', '**/api/student', {
      statusCode: 401,
      body: { message: 'Unauthorized' },
    }).as('getStudents401');

    const alertStub = cy.stub();
    cy.on('window:alert', alertStub);

    cy.visit('/dashboard/student-list');
    cy.wait('@getStudents401');

    cy.url().should('include', '/login');
    cy.wrap(alertStub).should(
      'have.been.calledWith',
      'Vous avez été déconnecté. Veuillez vous reconnecter.',
    );
  });

  it('StudentUpdate onReset should restore initial values and navigate to detail', () => {
    const id = 123;

    const initialStudent = {
      id,
      firstName: 'Ana',
      lastName: 'Kim',
      email: 'ana@ex.com',
      created_at: '2026-02-16',
      updated_at: '2026-02-16',
    };

    cy.intercept('GET', `**/api/student/${id}`, {
      statusCode: 200,
      body: initialStudent,
    }).as('getStudent');

    cy.intercept('PUT', `**/api/student/${id}`, {
      statusCode: 200,
      body: { ...initialStudent, firstName: 'New' },
    }).as('updateStudent');

    // 2) Aller sur la page update
    cy.visit(`/dashboard/student/${id}/update`);
    cy.wait('@getStudent');

    // 3) Vérifier que le formulaire est pré-rempli
    cy.get('[data-cy="student-update-firstName"]').should('have.value', 'Ana');
    cy.get('[data-cy="student-update-lastName"]').should('have.value', 'Kim');
    cy.get('[data-cy="student-update-email"]').should(
      'have.value',
      'ana@ex.com',
    );

    cy.get('[data-cy="student-update-firstName"]').clear().type('XXX');
    cy.get('[data-cy="student-update-lastName"]').clear().type('YYY');
    cy.get('[data-cy="student-update-email"]').clear().type('zzz@ex.com');

    // 5) Cliquer "Annuler" => doit restore + navigate vers detail
    cy.intercept('GET', `**/api/student/${id}`, {
      statusCode: 200,
      body: initialStudent,
    }).as('getStudentDetail');

    cy.get('[data-cy="student-update-cancel"]').click();

    // 6) Vérifier navigation vers detail
    cy.url().should('include', `/dashboard/student/${id}/detail`);

    // 7) Vérifier que la page detail affiche bien les valeurs initiales
    cy.wait('@getStudentDetail');
    cy.get('[data-cy="student-detail"]').should('be.visible');
    cy.contains('Ana').should('be.visible');
    cy.contains('Kim').should('be.visible');
    cy.contains('ana@ex.com').should('be.visible');
  });

  it('StudentDelete should navigate back to list when clicking cancel', () => {
    const id = 999;

    const student = {
      id,
      firstName: 'Ana',
      lastName: 'Kim',
      email: 'ana@test.com',
      created_at: '2026-02-16',
      updated_at: '2026-02-16',
    };

    // Stub GET student pour afficher la page delete correctement
    cy.intercept('GET', `**/api/student/${id}`, {
      statusCode: 200,
      body: student,
    }).as('getStudentDelete');

    // Aller sur la page delete
    cy.visit(`/dashboard/student/${id}/delete`);
    cy.wait('@getStudentDelete');

    // Vérifier que la page est affichée
    cy.contains('Suppression étudiant').should('be.visible');

    // WHEN : clic sur Annuler
    cy.get('[data-cy="student-delete-cancel"]').click();

    // THEN : navigation vers la liste
    cy.url().should('include', '/dashboard/student-list');
  });
});
