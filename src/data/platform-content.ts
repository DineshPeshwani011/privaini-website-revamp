// Content shared by the platform pages (/platform-overview, /what-we-find), as published on privaini.com.
import { categories } from './findings';

/** The eight finding categories. `overview` is the wording /platform-overview uses where it differs. */
export const platformCategories = categories.map((c) => ({
  ...c,
  overview: c.name === 'Consent Flow Failures' ? 'Banners that fail validity: pre-checked, dark-pattern, or firing before rejection.' : undefined,
}));
