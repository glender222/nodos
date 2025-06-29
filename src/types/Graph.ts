export type Position3D = [number, number, number];

export interface Node {
  id: string;
  position: Position3D;
  label: string;
}

export interface Edge {
  source: string;
  target: string;
  weight: number;
}

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

export interface PathResult {
  path: string[] | null;
  length: number;
  exists: boolean;
}

export interface GraphParams {
  num_nodes: number;
  connectivity: number;
  min_weight: number;
  max_weight: number;
  space_size: number;
}

export interface AdjacencyMatrix {
  nodes: string[];
  matrix: number[][];
}