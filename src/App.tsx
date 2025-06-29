import React, { useState, useCallback } from 'react';
import './App.css';
import GraphCanvas from './components/GraphCanvas';
import NodeControls from './components/NodeControls';
import EdgeControls from './components/EdgeControls';
import PathFinder from './components/PathFinder';
import NodeNameDialog from './components/NodeNameDialog';
import { GraphModel, type Position, type DijkstraResult } from './models/GraphModel';

const App: React.FC = () => {
  // Estado del modelo de grafo
  const [graphModel] = useState<GraphModel>(() => new GraphModel());
  const [graph, setGraph] = useState(graphModel.getGraph());
  
  // Estados de la interfaz
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [highlightedPath, setHighlightedPath] = useState<string[] | null>(null);
  const [pathDistance, setPathDistance] = useState<number | null>(null);
  const [mode, setMode] = useState<'view' | 'addNode' | 'addEdge'>('view');
  
  // Estados para el diálogo de nombre de nodo
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [pendingNodePosition, setPendingNodePosition] = useState<Position | null>(null);
  const [nextDefaultName, setNextDefaultName] = useState<string>('');
  const [nodeNameError, setNodeNameError] = useState<string>(''); // Nuevo estado para el error
  
  // Actualización del grafo cuando cambia el modelo
  const updateGraph = useCallback(() => {
    setGraph({...graphModel.getGraph()});
  }, [graphModel]);
  
  // Manejador para añadir un nodo
  const handleAddNode = useCallback(() => {
    if (mode === 'addNode') {
      // Si ya estamos en modo añadir, cancelar
      setMode('view');
    } else {
      // Activar modo de añadir nodo
      setMode('addNode');
      setSelectedNodeId(null);
      
      // Preparar el siguiente nombre predeterminado
      const nodeCount = Object.keys(graphModel.getGraph().nodes).length;
      setNextDefaultName(`Nodo ${nodeCount + 1}`);
    }
  }, [mode, graphModel]);

  // Manejador para el clic en el canvas
  const handleCanvasClick = useCallback((position: Position) => {
    if (mode === 'addNode') {
      // En lugar de crear el nodo inmediatamente, mostramos el diálogo
      setPendingNodePosition(position);
      setIsDialogOpen(true);
      setNodeNameError(''); // Limpiar cualquier error previo
    }
  }, [mode]);

  // Manejador para confirmar la creación del nodo con el nombre especificado
  const handleConfirmNodeName = useCallback((name: string) => {
    if (pendingNodePosition) {
      // Verificar si ya existe un nodo con ese nombre
      if (graphModel.hasNodeWithLabel(name)) {
        // Mostrar mensaje de error y mantener el diálogo abierto
        setNodeNameError("El nombre ya existe. Por favor, use un nombre diferente.");
      } else {
        // Si el nombre es único, crear el nodo
        const nodeId = graphModel.addNode(pendingNodePosition, name);
        updateGraph();
        setSelectedNodeId(nodeId);
        setIsDialogOpen(false);
        setPendingNodePosition(null);
        setNodeNameError('');
      }
    }
  }, [pendingNodePosition, graphModel, updateGraph]);

  // Manejador para cancelar la creación del nodo
  const handleCancelNodeName = useCallback(() => {
    setIsDialogOpen(false);
    setPendingNodePosition(null);
    setNodeNameError('');
  }, []);

  // Manejador para actualizar la posición de un nodo
  const handleNodePositionChange = useCallback((nodeId: string, position: Position) => {
    graphModel.updateNodePosition(nodeId, position);
    updateGraph();
  }, [graphModel, updateGraph]);

  // Manejador para eliminar un nodo
  const handleRemoveNode = useCallback(() => {
    if (selectedNodeId) {
      graphModel.removeNode(selectedNodeId);
      updateGraph();
      setSelectedNodeId(null);
      
      // Si hay un camino destacado que incluye este nodo, limpiarlo
      if (highlightedPath?.includes(selectedNodeId)) {
        setHighlightedPath(null);
      }
    }
  }, [selectedNodeId, graphModel, updateGraph, highlightedPath]);

  // Manejador para iniciar la creación de una conexión
  const handleStartEdgeCreation = useCallback(() => {
    if (mode === 'addEdge') {
      // Si ya estamos en modo añadir conexión, cancelar
      setMode('view');
    } else {
      // Activar modo de añadir conexión
      setMode('addEdge');
      setSelectedNodeId(null);
    }
  }, [mode]);

  // Manejador para añadir una conexión
  const handleAddEdge = useCallback((source: string, target: string, weight: number) => {
    try {
      graphModel.addEdge(source, target, weight);
      updateGraph();
      
      // Volver al modo vista después de crear la conexión
      setMode('view');
    } catch (error) {
      console.error(error);
      alert((error as Error).message);
    }
  }, [graphModel, updateGraph]);

  // Manejador para encontrar el camino más corto
  const handleFindPath = useCallback((startNodeId: string, endNodeId: string): DijkstraResult => {
    return graphModel.findShortestPath(startNodeId, endNodeId);
  }, [graphModel]);

  // Manejador para el camino encontrado
  const handlePathFound = useCallback((path: string[] | null, distance: number | null) => {
    setHighlightedPath(path);
    setPathDistance(distance);
  }, []);

  return (
    <div className="app">
      <header>
        <h1>Visualizador de Grafos - Algoritmo de Dijkstra</h1>
        <div className="subtitle">Crea, conecta y encuentra el camino más corto</div>
      </header>
      
      <div className="main-content">
        <aside className="sidebar">
          <NodeControls
            onAddNode={handleAddNode}
            onRemoveNode={handleRemoveNode}
            selectedNodeId={selectedNodeId}
            nodeCount={Object.keys(graph.nodes).length}
            isAddingNode={mode === 'addNode'}
          />
          
          <EdgeControls
            onAddEdge={handleAddEdge}
            onStartEdgeCreation={handleStartEdgeCreation}
            availableNodes={Object.keys(graph.nodes)}
            selectedNodeId={selectedNodeId}
            isAddingEdge={mode === 'addEdge'}
          />
          
          <PathFinder
            availableNodes={Object.keys(graph.nodes).map(id => graph.nodes[id].label)} // Modificado: Ahora envía las etiquetas en lugar de los IDs
            onFindPath={handleFindPath}
            onPathFound={handlePathFound}
          />
          
          <div className="instructions">
            <h3>Instrucciones</h3>
            <ol>
              <li>Crea nodos haciendo clic en "Agregar Nodo" y después en el canvas</li>
              <li>Mueve nodos arrastrándolos en el modo vista</li>
              <li>Conecta nodos usando "Conectar Nodos" y seleccionándolos</li>
              <li>Busca el camino más corto seleccionando nodos de inicio y fin</li>
            </ol>
          </div>
          
          {highlightedPath && pathDistance !== null && (
            <div className="path-result">
              <h3>Resultado</h3>
              <div className="path-display">
                <div className="path-nodes">
                  {highlightedPath.map(nodeId => graph.nodes[nodeId].label).join(' → ')}
                </div>
                <div className="path-distance">
                  Distancia total: <strong>{pathDistance.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          )}
        </aside>
        
        <main className="content">
          <GraphCanvas
            graph={graph}
            selectedNodeId={selectedNodeId}
            onNodeSelect={setSelectedNodeId}
            highlightedPath={highlightedPath}
            onNodePositionChange={handleNodePositionChange}
            onCanvasClick={handleCanvasClick}
            mode={mode}
          />
        </main>
      </div>
      
      <NodeNameDialog
        isOpen={isDialogOpen}
        onClose={handleCancelNodeName}
        onConfirm={handleConfirmNodeName}
        defaultName={nextDefaultName}
        error={nodeNameError} // Pasar el mensaje de error al diálogo
      />
      
      <footer>
        <p>Visualizador de Grafos con Algoritmo de Dijkstra - {new Date().getFullYear()} | Por glender222</p>
      </footer>
    </div>
  );
};

export default App;