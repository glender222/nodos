import axios from 'axios';
import type { GraphData, GraphParams, PathResult, AdjacencyMatrix } from '../types/Graph';

const API_URL = 'http://localhost:8000/api';

export const generateGraph = async (params: GraphParams): Promise<GraphData> => {
  const response = await axios.post(`${API_URL}/graph/generate`, params);
  return response.data;
};

export const getShortestPath = async (startNode: string, endNode: string): Promise<PathResult> => {
  const response = await axios.get(`${API_URL}/graph/shortest-path/${startNode}/${endNode}`);
  return response.data;
};

export const getAdjacencyMatrix = async (): Promise<AdjacencyMatrix> => {
  const response = await axios.get(`${API_URL}/graph/adjacency-matrix`);
  return response.data;
};