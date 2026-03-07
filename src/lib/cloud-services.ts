export type CloudIconName =
  | 'Globe'
  | 'Bot'
  | 'Zap'
  | 'Cloud'
  | 'Layers'
  | 'ShieldCheck'
  | 'Code2';

export interface CloudVariant {
  id: string;
  name: string;
  price: number;
  features: string[];
}

export interface CloudService {
  id: string;
  title: string;
  iconName: CloudIconName;
  description: string;
  variants: CloudVariant[];
}

export const CLOUD_SERVICES: CloudService[] = [
  {
    id: 'web-dev',
    title: 'Web Development',
    iconName: 'Globe',
    description: 'Building modern, high-speed digital presences tailored for performance.',
    variants: [
      { id: 'static', name: 'Static Website', price: 5999, features: ['3-5 Pages', 'Basic SEO', 'Responsive', '7 Days Support'] },
      { id: 'fullstack', name: 'Full Stack Website', price: 24999, features: ['Custom Auth', 'Database', 'API Logic', 'Deployment Help'] },
    ],
  },
  {
    id: 'bot-dev',
    title: 'Discord Bot Development',
    iconName: 'Bot',
    description: 'Custom automation for your community. From basic moderation to complex dashboards.',
    variants: [
      { id: 'normal', name: 'Normal Bot', price: 3999, features: ['Moderation', 'Commands', 'Logging'] },
      { id: 'advanced', name: 'Advanced Bot', price: 9999, features: ['Web Dashboard', 'DB Integration', 'API Connect'] },
      { id: 'custom', name: 'Custom Architecture', price: 0, features: ['Complex Logic', 'Neural Integrations', 'Price on Request'] },
    ],
  },
  {
    id: 'api-dev',
    title: 'API Development',
    iconName: 'Zap',
    description: 'Secure, scalable RESTful backend systems for your apps.',
    variants: [{ id: 'standard', name: 'REST API', price: 6999, features: ['Authentication', 'CRUD Operations', 'Documentation', 'Scale Ready'] }],
  },
  {
    id: 'n8n-auto',
    title: 'N8N Automation',
    iconName: 'Cloud',
    description: 'Streamline your workflows with powerful low-code automation.',
    variants: [{ id: 'standard', name: 'Workflow Logic', price: 4999, features: ['Webhook Integration', 'Workflow Design', 'Testing', 'Handover'] }],
  },
  {
    id: 'redesign',
    title: 'Website Re-Design',
    iconName: 'Layers',
    description: 'Give your existing platform a professional UI/UX makeover.',
    variants: [
      { id: 'basic', name: 'Basic UI Refresh', price: 4999, features: ['Color/Font Sync', 'Mobile Fix', 'Minor Layout Changes'] },
      { id: 'advanced', name: 'Advanced Overhaul', price: 9999, features: ['Animation Sync', 'Performance Fix', 'SEO Re-structure'] },
      { id: 'full', name: 'Full Re-Design', price: 0, features: ['Structural Rebuild', 'New Tech Stack', 'Price on Request'] },
    ],
  },
  {
    id: 'maintenance',
    title: 'Website Maintenance',
    iconName: 'ShieldCheck',
    description: 'Keep your systems running 24/7 with professional upkeep.',
    variants: [
      { id: 'basic', name: 'Basic Care', price: 4999, features: ['Uptime Monitoring', 'Minor Bug Fixes', 'Content Updates', 'Monthly Backup'] },
      { id: 'pro', name: 'Enterprise Management', price: 12999, features: ['Security Hardening', 'Weekly Backup', 'Priority Support', 'API Monitoring'] },
    ],
  },
];

export function getCloudServiceById(serviceId: string): CloudService | undefined {
  return CLOUD_SERVICES.find((service) => service.id === serviceId);
}

export function getCloudVariantById(serviceId: string, variantId: string): { service: CloudService; variant: CloudVariant } | null {
  const service = getCloudServiceById(serviceId);
  if (!service) return null;

  const variant = service.variants.find((item) => item.id === variantId);
  if (!variant) return null;

  return { service, variant };
}

