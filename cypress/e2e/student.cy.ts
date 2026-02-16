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

  it('1.2 should open student detail from list', () => {
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
});
