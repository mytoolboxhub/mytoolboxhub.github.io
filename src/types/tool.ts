export type ToolStatus = 'stable' | 'beta' | 'coming-soon';

export type CategoryId =
  | 'converters'
  | 'formatters'
  | 'generators'
  | 'encoders'
  | 'dev-tools'
  | 'text-tools'
  | 'cleaners'
  | 'image-tools'
  | 'network-tools'
  | 'crypto-tools'
  | 'math-tools';

export interface ToolDefinition {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  description: string;
  longDescription: string;
  category: CategoryId;
  icon: string;
  keywords: string[];
  status: ToolStatus;
  featured: boolean;
  publishedAt: string;
}
