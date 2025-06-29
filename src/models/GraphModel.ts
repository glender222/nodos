export interface Position {
  x: number;
  y: number;
}

export interface Node {
  id: string;
  position: Position;
  label: string;
  color?: string;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  weight: number;
}

export interface Graph {
  nodes: Record<string, Node>;
  edges: Edge[];
  isDirected: boolean; // Nueva propiedad para controlar la direccionalidad
}

export interface DijkstraResult {
  path: string[] | null;
  distances: Record<string, number>;
  previous: Record<string, string | null>;
}

export class GraphModel {
  private graph: Graph;
  private nextNodeId: number = 0;
  private nextEdgeId: number = 0;

  constructor(isDirected: boolean = false) { // Ahora aceptamos la direccionalidad como parámetro
    this.graph = {
      nodes: {},
      edges: [],
      isDirected: isDirected
    };
  }

  getGraph(): Graph {
    return this.graph;
  }

  setDirected(isDirected: boolean): void {
    this.graph.isDirected = isDirected;
  }

  isDirected(): boolean {
    return this.graph.isDirected;
  }

  addNode(position: Position, label?: string): string {
    const id = `n${this.nextNodeId++}`;
    const nodeLabel = label || id;
    
    this.graph.nodes[id] = {
      id,
      position,
      label: nodeLabel,
      color: this.generateRandomPastelColor()
    };
    
    return id;
  }

  hasNodeWithLabel(label: string): boolean {
    return Object.values(this.graph.nodes).some(node => 
      node.label.toLowerCase() === label.toLowerCase()
    );
  }

  removeNode(id: string): void {
    // Eliminar el nodo
    delete this.graph.nodes[id];
    
    // Eliminar las conexiones relacionadas
    this.graph.edges = this.graph.edges.filter(
      edge => edge.source !== id && edge.target !== id
    );
  }

  updateNodePosition(id: string, position: Position): void {
    if (this.graph.nodes[id]) {
      this.graph.nodes[id].position = position;
    }
  }

  addEdge(source: string, target: string, weight: number): string {
    // Verificar que los nodos existen
    if (!this.graph.nodes[source] || !this.graph.nodes[target]) {
      throw new Error("No se puede crear una conexión entre nodos que no existen");
    }

    // Verificar que no sea el mismo nodo
    if (source === target) {
      throw new Error("No se pueden crear conexiones de un nodo a sí mismo");
    }

    // Verificar si ya existe la conexión
    // La lógica cambia según si el grafo es direccional o no
    const existingEdge = this.graph.isDirected 
      ? this.graph.edges.find(edge => edge.source === source && edge.target === target)
      : this.graph.edges.find(edge => 
          (edge.source === source && edge.target === target) || 
          (edge.source === target && edge.target === source)
        );

    if (existingEdge) {
      throw new Error("Ya existe una conexión entre estos nodos en esta dirección");
    }

    const id = `e${this.nextEdgeId++}`;
    const edge: Edge = {
      id,
      source,
      target,
      weight
    };

    this.graph.edges.push(edge);
    return id;
  }

  updateEdgeWeight(id: string, weight: number): void {
    const edgeIndex = this.graph.edges.findIndex(e => e.id === id);
    if (edgeIndex !== -1) {
      this.graph.edges[edgeIndex].weight = weight;
    }
  }

  removeEdge(id: string): void {
    this.graph.edges = this.graph.edges.filter(edge => edge.id !== id);
  }

  clear(): void {
    this.graph = {
      nodes: {},
      edges: [],
      isDirected: this.graph.isDirected // Mantener el modo actual
    };
    this.nextNodeId = 0;
    this.nextEdgeId = 0;
  }

  getNodeCount(): number {
    return Object.keys(this.graph.nodes).length;
  }

  getEdgeCount(): number {
    return this.graph.edges.length;
  }

  findShortestPath(startNodeId: string, endNodeId: string): DijkstraResult {
    return dijkstra(this.graph, startNodeId, endNodeId);
  }

  private generateRandomPastelColor(): string {
    // Generar colores pastel para los nodos
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 80%)`;
  }
}

// Implementación del algoritmo de Dijkstra
function dijkstra(graph: Graph, startNodeId: string, endNodeId: string): DijkstraResult {
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

    // Verificar los vecinos, considerando la direccionalidad del grafo
    let edges;
    if (graph.isDirected) {
      // En grafo direccional, solo considerar aristas que salen del nodo actual
      edges = graph.edges.filter(edge => edge.source === currentNodeId);
    } else {
      // En grafo bidireccional, considerar todas las aristas conectadas al nodo
      edges = graph.edges.filter(edge => 
        edge.source === currentNodeId || edge.target === currentNodeId
      );
    }

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