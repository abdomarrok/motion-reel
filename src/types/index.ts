export interface BrandConfig {
  name: string;
  accentColor: string;
  bgColor: string;
  textColor: string;
  font: string;
  direction: 'rtl' | 'ltr';
}

export interface SceneConfig {
  id: string;
  label: string;
  text: string;
  from: number;
  to: number;
  springK: number;
  springD: number;
}

export interface TemplateConfig {
  brand: BrandConfig;
  duration: number;
  scenes: SceneConfig[];
}

export interface TemplateMeta {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
}

export interface TemplateDefinition {
  meta: TemplateMeta;
  defaultConfig: (brand?: Partial<BrandConfig>) => TemplateConfig;
  toHTML: (config: TemplateConfig) => string;
}

export interface CueItem {
  t: number;
  type: string;
  amp: number;
}

export interface RenderJobProgress {
  status: 'running' | 'done' | 'cancelled' | 'error';
  stage?: string;
  percent?: number;
  downloadUrl?: string;
  error?: string;
}
