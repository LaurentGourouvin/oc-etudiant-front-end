# 🧩 Frontend – Plan de Tests (Angular + Jest)

## 🎯 Objectif

Garantir la fiabilité des :

- Services (tests unitaires)
- Guards (tests unitaires)
- Composants (tests unitaires avec mocking des services)
- Navigation & gestion d’erreurs

Approche basée sur la pyramide des tests :

- Tests unitaires majoritaires

---

# 🟦 1️⃣ Tests Unitaires – Services

---

## 🔐 AuthService

### 1. setToken()

**Cas : stockage du token**

- Entrée : `"abc.def.ghi"`
- Attendu :
  - `localStorage.setItem` appelé
  - Clé = `"auth_token"`
  - Valeur = token

---

### 2. getToken()

**Cas : token présent**

- Mock `localStorage`
- Attendu : retourne le token

**Cas : token absent**

- Attendu : retourne `null`

---

### 3. clearToken()

- Appelle `localStorage.removeItem`
- Supprime la clé `auth_token`

---

### 4. isAuthenticated()

**Cas : aucun token**

- Retourne `false`

**Cas : token valide non expiré**

- `exp > Date.now()`
- Retourne `true`

**Cas : token expiré**

- Retourne `false`

**Cas : token invalide (JSON parse error)**

- Catch erreur
- Retourne `false`

---

## 🎓 StudentService

Tests unitaires avec `HttpClientTestingModule`.

### 1. getAllStudents()

- Méthode GET `/api/student`
- Header contient `Authorization: Bearer <token>`

---

### 2. getStudentById(id)

- GET `/api/student/{id}`
- Header Authorization présent

---

### 3. createStudent(student)

- POST `/api/student`
- Body correct
- Header Authorization présent

---

### 4. updateStudent(id, student)

- PUT `/api/student/{id}`
- Body correct
- Header Authorization présent

---

### 5. deleteStudent(id)

- DELETE `/api/student/{id}`
- Header Authorization présent

---

# 🟦 2️⃣ Tests Unitaires – Guard

---

## 🔒 AuthGuard

### 1. Utilisateur authentifié

- `auth.isAuthenticated()` retourne `true`
- Guard retourne `true`
- Aucune navigation

---

### 2. Utilisateur non authentifié

- `auth.isAuthenticated()` retourne `false`
- `alert()` appelé
- `router.navigateByUrl('/login')` appelé
- Guard retourne `false`

---

# 🟦 3️⃣ Tests Unitaires – Composants

Tous les composants utilisent :

- Mock des services
- Mock Router
- Mock ActivatedRoute si nécessaire
- Jest + TestBed

---

# 🔑 LoginComponent

### 1. Initialisation

- FormGroup créé
- Champs `login` et `password`
- Validators required

---

### 2. Soumission formulaire invalide

- `submitted = true`
- Aucun appel `userService.login()`

---

### 3. Login succès

- Appel `userService.login()`
- `AuthService.setToken()` appelé
- Navigation vers `/dashboard`
- `loading` repasse à `false`

---

### 4. Login erreur

- `errorMessage` mis à jour
- Pas de navigation

---

### 5. onReset()

- Reset formulaire
- `submitted = false`
- `errorMessage = null`

---

# 📋 StudentListComponent

### 1. Chargement OK

- `studentService.getAllStudents()` appelé
- `students$` contient la liste

---

### 2. Erreur 401

- `alert()` appelé
- Navigation `/login`
- Retourne `of([])`

---

### 3. Erreur autre

- `errorMessage = 'Erreur chargement'`
- Retourne `of([])`

---

### 4. viewStudent()

- Navigation vers `/dashboard/student/{id}/detail`

---

### 5. viewDeleteStudent()

- Navigation vers `/dashboard/student/{id}/delete`

---

# 🔍 StudentDetailComponent

### 1. Initialisation avec ID

- Lecture paramètre route
- Appel `getStudentById`
- `student` assigné

---

### 2. Erreur 401

- Alert
- Navigation `/login`

---

### 3. Erreur autre

- `errorMessage = 'Aucun étudiant correspondant trouvé.'`

---

### 4. goBack()

- Navigation `/dashboard/student-list`

---

### 5. goUpdateView()

- Navigation `/dashboard/student/{id}/update`

---

# ✏️ StudentUpdateComponent

### 1. Initialisation

- FormGroup initialisé
- PatchValue après récupération étudiant

---

### 2. Soumission valide

- Appel `updateStudent`
- Alert succès
- Navigation vers détail

---

### 3. Erreur 401

- Alert
- Navigation `/login`

---

### 4. Erreur autre

- `errorMessage = "Erreur lors de la mise à jour..."`

---

### 5. onReset()

- PatchValue avec student original
- Navigation vers détail

---

# ➕ StudentCreateComponent

### 1. Initialisation

- FormGroup avec validators required + email

---

### 2. Formulaire invalide

- `markAllAsTouched()`
- Aucun appel service

---

### 3. Création succès

- Appel `createStudent`
- Reset form
- Alert succès
- Navigation student-list

---

### 4. Erreur 401

- Alert
- Navigation `/login`

---

### 5. Erreur autre

- `errorMessage = "Erreur durant la création..."`

---

# 🗑 StudentDeleteComponent

### 1. Initialisation avec ID

- Appel `getStudentById`
- `student` assigné

---

### 2. Suppression succès

- Appel `deleteStudent`
- Alert succès
- Navigation `/dashboard/student-list`

---

### 3. Erreur 401

- Alert
- Navigation `/login` (selon implémentation)

---

### 4. Erreur autre

- `errorMessage = "Erreur lors de la suppression..."`

---

# 📊 Couverture attendue

- Services
- Guards
- Composants : couverture logique complète
- Tests couvrent :
  - Succès
  - Erreurs métier
  - 401
  - Navigation
  - Formulaires
  - Gestion d’état
