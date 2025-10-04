// Export all template configurations
export { proCorporateTemplate } from './pro-corporate';
export { modernStripeTemplate } from './modern-stripe';
export { minimalOutlineTemplate } from './minimal-outline';
export { elegantDarkTemplate } from './elegant-dark';
export { classicColumnTemplate } from './classic-column';

// Export all preview components
export { ProCorporatePreview } from './pro-corporate';
export { ModernStripePreview } from './modern-stripe';
export { MinimalOutlinePreview } from './minimal-outline';
export { ElegantDarkPreview } from './elegant-dark';
export { ClassicColumnPreview } from './classic-column';

// Array of all templates
import { InvoiceTemplate } from '../invoice-templates';
import { proCorporateTemplate } from './pro-corporate';
import { modernStripeTemplate } from './modern-stripe';
import { minimalOutlineTemplate } from './minimal-outline';
import { elegantDarkTemplate } from './elegant-dark';
import { classicColumnTemplate } from './classic-column';

export const allTemplates: InvoiceTemplate[] = [
  proCorporateTemplate,
  modernStripeTemplate,
  minimalOutlineTemplate,
  elegantDarkTemplate,
  classicColumnTemplate
];
