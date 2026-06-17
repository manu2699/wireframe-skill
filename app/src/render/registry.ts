// Node-type → renderer registry. Adding a new node type means registering a
// component here, not editing a switch (OCP). Unknown types fall back to Box.

import type { FC } from "react";
import type { NodeType, WFNode } from "../types";
import { Layout } from "./Layout";
import { Nav } from "./Nav";
import { Table } from "./Table";
import { Raw } from "./Raw";
import { Box } from "./Box";

export type NodeRenderer = FC<{ node: WFNode & { _id?: string } }>;

export const registry: Record<NodeType, NodeRenderer> = {
  row: Layout,
  col: Layout,
  grid: Layout,
  nav: Nav,
  table: Table,
  raw: Raw,
  box: Box,
};

export const fallbackRenderer: NodeRenderer = Box;
