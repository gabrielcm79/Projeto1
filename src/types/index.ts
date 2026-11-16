export type BlockType = 
  | 'paragraph' 
  | 'heading1' 
  | 'heading2' 
  | 'heading3' 
  | 'todo' 
  | 'bullet' 
  | 'number' 
  | 'code' 
  | 'callout' 
  | 'quote' 
  | 'divider' 
  | 'image'
  | 'table'
  | 'page_link'
  | 'whiteboard'
  | 'chart'
  | 'page_embed'
  | 'mermaid';

export type WhiteboardTool = 'select' | 'pen' | 'eraser' | 'rectangle' | 'circle' | 'arrow' | 'line' | 'text' | 'sticky' | 'connector';

export type ChartType = 'bar' | 'line' | 'pie' | 'doughnut' | 'horizontalBar' | 'metric';

export interface ChartDataset {
  label: string;
  values: number[];
  color?: string;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataSource {
  pageId: string;
  groupBy?: 'status' | 'priority' | 'assignee' | 'count';
  metricType?: 'total' | 'completed' | 'in_progress' | 'todo' | 'percentage';
  asPercentage?: boolean;
}

export type EmbedMode = 'full' | 'first_block' | 'database' | 'kanban' | 'calendar' | 'gantt';

export interface WhiteboardStroke {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

export interface WhiteboardShape {
  id: string;
  type: 'rectangle' | 'circle' | 'arrow' | 'line';
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor: string;
  fillColor?: string;
  strokeWidth: number;
}

export interface WhiteboardSticky {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  color: string;
}

export interface WhiteboardText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
}

export interface WhiteboardConnector {
  id: string;
  fromShapeId?: string;
  toShapeId?: string;
  fromPoint: { x: number; y: number };
  toPoint: { x: number; y: number };
  label?: string;
  color: string;
  strokeWidth: number;
  style: 'solid' | 'dashed' | 'dotted';
  endArrow: boolean;
  startArrow: boolean;
}

export interface WhiteboardData {
  strokes: WhiteboardStroke[];
  shapes: WhiteboardShape[];
  stickies: WhiteboardSticky[];
  texts: WhiteboardText[];
  connectors?: WhiteboardConnector[];
}

export interface BlockProperty {
  checked?: boolean;
  language?: string;
  icon?: string;
  color?: string;
  author?: string;
  caption?: string;
  url?: string;
  tableData?: string[][];
  targetPageId?: string;
  whiteboardData?: WhiteboardData;
  // Chart block
  chartType?: ChartType;
  chartData?: ChartData;
  chartTitle?: string;
  chartDataSource?: ChartDataSource;
  chartAsPercentage?: boolean;
  // Page embed block
  embedPageId?: string;
  embedMode?: EmbedMode;
}

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  properties?: BlockProperty;
}

export type ViewType = 'document' | 'table' | 'board' | 'calendar' | 'gantt' | 'whiteboard';

export interface DatabaseColumn {
  id: string;
  name: string;
  type: 'text' | 'select' | 'status' | 'date' | 'priority' | 'checkbox';
  options?: { id: string; label: string; color: string }[];
}

export type RecurrenceFrequency = 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'custom_days';

export interface TaskRecurrence {
  frequency: RecurrenceFrequency;
  daysOfWeek?: number[]; // 0: Dom, 1: Seg, 2: Ter, 3: Qua, 4: Qui, 5: Sex, 6: Sáb
  interval?: number;
  label?: string; // Ex: "Seg, Qua, Sex"
}

export interface DatabaseRow {
  id: string;
  title: string;
  icon?: string;
  coverUrl?: string;
  status: string;
  priority?: 'Baixa' | 'Média' | 'Alta' | 'Urgente';
  tags?: string[];
  date?: string; // Data de Início ou Prazo
  endDate?: string; // Data de Término para Gantt
  recurrence?: TaskRecurrence;
  assignee?: string;
  notes?: string;
  checked?: boolean;
  blocks?: Block[]; // Editor de páginas completo para cada item/card!
}

export interface StatusOption {
  id: string;
  name: string;
  color: string;
}

export const DEFAULT_STATUSES: StatusOption[] = [
  { id: 'A Fazer', name: 'A Fazer', color: '#f59e0b' },
  { id: 'Em Progresso', name: 'Em Progresso', color: '#3b82f6' },
  { id: 'Concluído', name: 'Concluído', color: '#10b981' },
];

export interface DatabaseConfig {
  columns: DatabaseColumn[];
  rows: DatabaseRow[];
  activeView: 'table' | 'board' | 'calendar' | 'gantt';
  statuses?: StatusOption[];
}

export interface Page {
  id: string;
  parentId: string | null;
  title: string;
  icon: string;
  coverUrl?: string;
  type: ViewType;
  blocks: Block[];
  databaseConfig?: DatabaseConfig;
  whiteboardData?: WhiteboardData;
  isFavorite?: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceSettings {
  name: string;
  theme: 'dark' | 'light';
  font: 'sans' | 'serif' | 'mono';
  fullWidth: boolean;
  sidebarCollapsed: boolean;
}

export interface WorkspaceData {
  settings: WorkspaceSettings;
  pages: Page[];
  activePageId: string;
}
