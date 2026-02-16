describe('Students - CRUD', () => {
  const user = {
    firstName: 'John',
    lastName: 'Doe',
    login: `e2e_user_${Date.now()}`, // ✅ login unique pour éviter collisions
    password: 'password',
  };

  const uniqueEmail = () => `ana.${Date.now()}@ex.com`;

  const getToken = () =>
    cy.window().then((win) => {
      const token = win.localStorage.getItem('auth_token');
      expect(token).to.be.a('string').and.not.be.empty;
      return token as string;
    });

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

  const loginUI = () => {
    cy.visit('/login');

    cy.get('[data-cy="login-input"]').type(user.login);
    cy.get('[data-cy="password-input"]').type(user.password);

    cy.get('[data-cy="login-submit"]').click();
    cy.url().should('include', '/dashboard');

    // ✅ token présent
    getToken();
  };

  beforeEach(() => {
    cy.clearLocalStorage();

    // (re)create user (si existe déjà -> 400, on ignore)
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

    // dashboard => StudentCreate (chez toi c’est le composant par défaut)
    cy.visit('/dashboard');

    cy.get('[data-cy="student-firstName"]').type('Ana');
    cy.get('[data-cy="student-lastName"]').type('Kim');
    cy.get('[data-cy="student-email"]').type(email);

    cy.get('[data-cy="student-create-submit"]').click();

    // ton component navigate vers /dashboard/student-list
    cy.url().should('include', '/dashboard/student-list');

    cy.contains('td', email).should('be.visible');
    cy.contains('td', 'Ana').should('be.visible');
    cy.contains('td', 'Kim').should('be.visible');
  });

  it('1.2 should open student detail from list', () => {
    const email = uniqueEmail();
    apiCreateStudent({ firstName: 'Ana', lastName: 'Kim', email });

    cy.visit('/dashboard/student-list');

    // ✅ on trouve la ligne via contenu email
    cy.contains('tr', email).within(() => {
      cy.get('[data-cy="student-view"]').click();
    });

    // ton routing : /dashboard/student/:id/detail
    cy.url().should('include', '/detail');

    // fallback simple: l’email doit apparaître quelque part
    cy.contains(email).should('be.visible');
  });

  it('1.3 should update a student', () => {
    const email = uniqueEmail();
    apiCreateStudent({ firstName: 'Ana', lastName: 'Kim', email });

    apiFindStudentIdByEmail(email).then((id) => {
      const updatedEmail = `new.${Date.now()}@ex.com`;

      cy.visit(`/dashboard/student/${id}/update`);

      // ✅ si ton update HTML a les mêmes ids (firstName/lastName/email), ça passe
      // (id fallback tant qu’on n’a pas data-cy sur Update)
      cy.get('#firstName').clear().type('New');
      cy.get('#lastName').clear().type('Name');
      cy.get('#email').clear().type(updatedEmail);

      // ✅ ne dépend pas du libellé: click submit du form
      cy.get('form').find('button[type="submit"]').click();

      // navigue vers /detail
      cy.url().should('include', `/dashboard/student/${id}/detail`);

      // vérif simple
      cy.contains('New').should('be.visible');
      cy.contains('Name').should('be.visible');
      cy.contains(updatedEmail).should('be.visible');
    });
  });

  it('1.4 should delete a student', () => {
    const email = uniqueEmail();
    apiCreateStudent({ firstName: 'Ana', lastName: 'Kim', email });

    apiFindStudentIdByEmail(email).then((id) => {
      cy.visit(`/dashboard/student/${id}/delete`);

      // ton app utilise alert() -> on neutralise
      cy.on('window:alert', () => {});

      // fallback: clique le submit si c’est un form, sinon un bouton unique
      // adapte dès qu’on met data-cy sur le bouton delete
      cy.get('button')
        .contains(/supprimer|confirmer|valider/i)
        .click();

      cy.url().should('include', '/dashboard/student-list');
      cy.contains(email).should('not.exist');
    });
  });
});
