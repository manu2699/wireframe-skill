// Schema for the wireframe JSON model the agent authors.
// Monochrome, mid-fidelity: structure + IA + flow, never colors or real design.

export type Kind =
  | "kpi"
  | "stat"
  | "chart:donut"
  | "chart:line"
  | "chart:bars"
  | "card"
  | "table"
  | "list"
  | "form"
  | "button"
  | "tabs"
  | "avatar"
  | "image";

export type Mod = "tall" | "taller" | "placeholder" | "solid" | "shaded";

export type NodeType =
  | "box"
  | "row"
  | "col"
  | "grid"
  | "table"
  | "nav"
  | "raw";

// A single navigation item inside an enumerated nav group.
export interface NavItem {
  text: string;
  active?: boolean;
  badge?: string | number;
  goto?: string;   // screenId to switch to on click
  opens?: string;  // modalId to open on click
  backend?: string;
  ds?: string;
}

export interface NavGroup {
  label?: string;     // section heading, e.g. "WORKFLOW"
  items: NavItem[];
}

export interface WFNode {
  type: NodeType;
  label?: string;
  kind?: Kind;
  mods?: Mod[];
  cols?: number;            // grid: --cols
  children?: WFNode[];

  // table
  headers?: string[];
  rows?: string[][];

  // nav (IA)
  side?: "left" | "top";
  groups?: NavGroup[];

  // raw escape hatch
  html?: string;

  // annotations
  backend?: string;
  ds?: string;

  // flow / interaction (clickable prototype)
  goto?: string;            // screenId
  opens?: string;           // modalId
  action?: string;          // "submit" | "save" | "delete" | …
}

export interface WFState {
  id: string;
  name: string;
  nodes: WFNode[];
}

export interface WFScreen {
  id: string;
  name: string;
  states: WFState[];
}

export interface WFModal {
  id: string;
  name: string;
  nodes: WFNode[];
}

export interface WFModel {
  feature: string;
  change?: string;
  designSource?: string;
  screens: WFScreen[];
  modals?: WFModal[];
}

// One stored review comment, keyed by stable wf-id.
export interface Comment {
  id: string;
  label: string;
  screen: string;
  state: string;
  text: string;
}
