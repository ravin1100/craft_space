### 🛬 1. Landing & Authentication

- [ ] User visits the landing page.
- [ ] User clicks on **Login** or **SignUp**.
- [ ] User authenticates with credentials (JWT-based).
- [ ] On success, user is redirected to their **Workspace Dashboard**.

---

### 🧱 2. Workspace Dashboard

- [ ] User sees a list of their **Workspaces** on the sidebar.
- [ ] User clicks on a workspace OR creates a new one:
  - Enters workspace name.
  - (Optional) Sets a workspace icon.

---

### 📄 3. Viewing a Page

- [ ] Inside a workspace, user sees a list of **Pages**.
- [ ] User clicks on a page.
- [ ] Page content loads with **Lexical Editor**, fully editable.
- [ ] Page includes:
  - Title input.
  - Rich content rendered via Lexical.
  - Optional icon and cover image.

---

### ✍️ 4. Editing a Page (Lexical Editor)

- [ ] User types content using a rich text editor.
- [ ] User presses **Enter** to create new blocks.
- [ ] User uses **slash (/) commands** to insert:
  - Headings
  - Lists
  - Quotes
  - Code blocks
- [ ] User uses **Backspace** to delete blocks.
- [ ] User sees **toolbar options** on text selection:
  - Bold, Italic, Link, etc.
- [ ] User actions are saved automatically OR on keyboard shortcut (e.g., `Ctrl+S`).

---

### ➕ 5. Page Actions

- [ ] User can:
  - Rename page
  - Delete page
  - Duplicate page
  - Move page to another workspace
- [ ] Changes reflect instantly in sidebar and dashboard.

---

### 🧰 6. Workspace Actions

- [ ] User can:
  - Rename workspace
  - Delete workspace (with confirmation)
  - View all pages within the workspace

---

### 🔐 7. Auth Flows & State Management

- [ ] Authenticated user state is stored in localStorage or cookies.
- [ ] Unauthorized routes redirect to login page.
- [ ] User can **Logout**, clearing local storage and navigating to landing page.

---

### 📱 8. UX Details & Responsiveness

- [ ] Sidebar collapses on smaller screens.
- [ ] Floating action buttons or icons appear where needed.
- [ ] Skeletons/spinners show during data fetch.
- [ ] Smooth transitions (Framer Motion) enhance navigation.
