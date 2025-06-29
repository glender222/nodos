
import { type Graph } from '../models/GraphModel';

export interface DijkstraResult {
  path: string[] | null;
  distances: Record<string, number>;
  previous: Record<string, string | null>;
}

export function dijkstra(graph: Graph, startNodeId: string, endNodeId: string): DijkstraResult {
  // Inicializar distancias y nodos previos
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>();

  // Preparar los datos iniciales
  for (const nodeId of Object.keys(graph.nodes)) {
    distances[nodeId] = nodeId === startNodeId ? 0 : Infinity;
    previous[nodeId] = null;
    unvisited.add(nodeId);
  }

  // Mientras haya nodos sin visitar
  while (unvisited.size > 0) {
    // Encontrar el nodo no visitado con la menor distancia
    let currentNodeId: string | null = null;
    let minDistance = Infinity;

    for (const nodeId of unvisited) {
      if (distances[nodeId] < minDistance) {
        currentNodeId = nodeId;
        minDistance = distances[nodeId];
      }
    }

    // Si no se encontró nodo o ya llegamos al destino, terminamos
    if (currentNodeId === null || currentNodeId === endNodeId || minDistance === Infinity) {
      break;
    }

    // Marcar como visitado
    unvisited.delete(currentNodeId);

    // Verificar los vecinos
    const edges = graph.edges.filter(edge => 
      edge.source === currentNodeId || edge.target === currentNodeId
    );

    for (const edge of edges) {
      // Identificar el nodo vecino
      const neighborId = edge.source === currentNodeId ? edge.target : edge.source;
      
      // Calcular posible nueva distancia
      const distance = distances[currentNodeId] + edge.weight;
      
      // Si encontramos una distancia menor, actualizamos
      if (distance < distances[neighborId]) {
        distances[neighborId] = distance;
        previous[neighborId] = currentNodeId;
      }
    }
  }

  // Reconstruir el camino
  const path: string[] = [];
  let current: string | null = endNodeId;
  
  if (distances[endNodeId] === Infinity) {
    return { path: null, distances, previous };
  }
  
  while (current) {
    path.unshift(current);
    current = previous[current];
  }
  
  return {
    path: path[0] === startNodeId ? path : null,
    distances,
    previous
  };
}