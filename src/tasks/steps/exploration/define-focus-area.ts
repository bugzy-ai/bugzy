import type { TaskStep } from '../types';

export const defineFocusAreaStep: TaskStep = {
  id: 'define-focus-area',
  title: 'Define Focus Area',
  category: 'exploration',
  content: `## Define Focus Area

Based on arguments, select exploration strategy:

| Focus | Key Areas |
|-------|-----------|
| **auth** | Login/logout, password recovery, sessions, role-based access |
| **navigation** | Menu structure, URLs, breadcrumbs, categories |
| **search** | Search interfaces, filters, autocomplete, results |
| **content** | Content types, forms, media, CRUD operations |
| **admin** | Admin panels, settings, user management |
| **(none)** | Comprehensive: explore all areas systematically |

**For each focus area:**
1. List specific exploration targets
2. Prioritize by importance
3. Note any known entry points

**Output:** Prioritized list of exploration targets.`,
  tags: ['exploration', 'strategy'],
};
