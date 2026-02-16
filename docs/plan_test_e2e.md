# 🌍 Frontend – Plan de tests E2E (Cypress)

> Objectif : tester les parcours utilisateur **E2E** (UI → API → DB).
> Pré-requis : le **backend est lancé** , et l’**app Angular est lancée**.

---

## 🔧 Pré-requis techniques

- Lancer le back : `mvn spring-boot:run`
- Lancer le front : `npm start`
- Lancer Cypress :
  - mode UI : `npx cypress open`
  - mode headless : `npx cypress run`

---

## 0) Auth – Login obligatoire

### Cas 0.1 — Login OK (happy path)

**Données :**

- login: `login`
- password: `password`

**Étapes :**

1. Aller sur `/login`
2. Remplir login/password
3. Cliquer “Login”

**Attendus :**

- Redirection vers `/dashboard`
- Token stocké dans `localStorage` (`auth_token`)
- Une alerte **ne doit pas** apparaître

---

### Cas 0.2 — Login KO (bad credentials)

**Étapes :**

1. Aller sur `/login`
2. Remplir login/password invalides
3. Soumettre

**Attendus :**

- Rester sur `/login`
- Affichage `errorMessage`
- Pas de token dans `localStorage`

---

### Cas 0.3 — Guard : accès dashboard sans token

**Étapes :**

1. Vider `localStorage`
2. Aller sur `/dashboard` (ou `/dashboard/student-list`)

**Attendus :**

- Alert “Vous avez été déconnecté…”
- Redirection `/login`

---

## 1) Students — CRUD complet

> Stratégie : utiliser un email unique par test (timestamp) pour éviter les collisions.

### Cas 1.1 — Créer un étudiant

**Étapes :**

1. Login
2. Aller sur `/dashboard/student/create`
3. Remplir :
   - firstName: Ana
   - lastName: Kim
   - email: `ana+{timestamp}@ex.com`
4. Soumettre

**Attendus :**

- Message/alert de succès
- Redirection vers `/dashboard/student-list`
- L’étudiant apparaît dans la liste

---

### Cas 1.2 — Liste des étudiants

**Précondition :**

- Au moins 2 étudiants existent

**Étapes :**

1. Login
2. Aller sur `/dashboard/student-list`

**Attendus :**

- La liste s’affiche
- Au moins 2 lignes
- Chaque ligne affiche `firstName`, `lastName`, `email`

---

### Cas 1.3 — Détail étudiant

**Précondition :**

- Un étudiant existe

**Étapes :**

1. Depuis la liste, cliquer “voir” sur un étudiant

**Attendus :**

- URL de type `/dashboard/student/{id}/detail` (ou route réelle)
- Les champs affichés correspondent à l’étudiant (firstName/lastName/email)

---

### Cas 1.4 — Update étudiant

**Précondition :**

- Un étudiant existe

**Étapes :**

1. Aller sur la page détail
2. Cliquer “modifier”
3. Modifier :
   - firstName: New
   - lastName: Name
   - email: `new+{timestamp}@ex.com`
4. Soumettre

**Attendus :**

- Alert succès “Étudiant mis à jour…”
- Redirection vers la page détail
- Les valeurs affichées sont mises à jour

---

### Cas 1.5 — Delete étudiant

**Précondition :**

- Un étudiant existe

**Étapes :**

1. Depuis la liste, aller sur la vue delete (ou cliquer le bouton supprimer)
2. Confirmer suppression

**Attendus :**

- Alert succès “Étudiant supprimé…”
- Redirection vers `/dashboard/student-list`
- L’étudiant n’apparaît plus

---

## 2) Gestion des erreurs / sécurité (E2E utile)

### Cas 2.1 — Token expiré → redirection login

**Étapes :**

1. Login
2. Remplacer `localStorage.auth_token` par un token invalide/expiré (string bidon)
3. Aller sur `/dashboard/student-list`

**Attendus :**

- Alert “Vous avez été déconnecté…”
- Redirection `/login`

---

### Cas 2.2 — Validation formulaire create (champ manquant)

**Étapes :**

1. Login
2. Aller sur create student
3. Soumettre formulaire vide

**Attendus :**

- Le formulaire ne part pas (pas de requête API)
- Erreurs de validation visibles (required/email)
- On reste sur la page

---
