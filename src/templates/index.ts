import { kineticTextTemplate } from './kinetic-text';
import { productShowcaseTemplate } from './product-showcase';
import { brandIntroTemplate } from './brand-intro';
import { TemplateDefinition } from '../types';

export const TEMPLATES: TemplateDefinition[] = [
  kineticTextTemplate,
  productShowcaseTemplate,
  brandIntroTemplate
];

export function getTemplateById(id: string): TemplateDefinition | null {
  return TEMPLATES.find(t => t.meta.id === id) || null;
}

export { kineticTextTemplate, productShowcaseTemplate, brandIntroTemplate };
