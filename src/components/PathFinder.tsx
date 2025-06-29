import React, { useState, useEffect } from 'react';
import { type DijkstraResult } from '../models/GraphModel';

interface PathFinderProps {
  availableNodes: string[];
  onFindPath: (startNodeId: string, endNodeId: string) => DijkstraResult;
  onPathFound: (path: string[] | null, distance: number | null) => void;
}

const PathFinder: React.FC<PathFinderProps> = ({ 
  availableNodes, 
  onFindPath,
  onPathFound
}) => {
  const [startNodeId, setStartNodeId] = useState<string>('');
  const [endNodeId, setEndNodeId] = useState<string>('');
  const [pathDistance, setPathDistance] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const hasNodes = availableNodes.length > 0;

  const findShortestPath = () => {
    if (!startNodeId || !endNodeId) {
      setErrorMessage('Selecciona los nodos de inicio y fin');
      return;
    }

    if (startNodeId === endNodeId) {
      setErrorMessage('Los nodos de inicio y fin deben ser diferentes');
      return;
    }

    try {
      // Ejecutar el algoritmo de Dijkstra
      const result = onFindPath(startNodeId, endNodeId);
      
      if (!result.path) {
        setErrorMessage(`No existe un camino desde ${startNodeId} hasta ${endNodeId}`);
        onPathFound(null, null); // Corregido: ahora ambos son null cuando no hay camino
        setPathDistance(null);
        return;
      }

      setErrorMessage('');
      const distance = result.distances[endNodeId];
      setPathDistance(distance);
      onPathFound(result.path, distance);
    } catch (e) {
      setErrorMessage((e as Error).message);
    }
  };

  // Limpiar el estado cuando cambian los nodos disponibles
  useEffect(() => {
    if (!availableNodes.includes(startNodeId)) {
      setStartNodeId('');
    }
    if (!availableNodes.includes(endNodeId)) {
      setEndNodeId('');
    }
    if (startNodeId === '' || endNodeId === '') {
      setPathDistance(null);
      onPathFound(null, null); // Corregido: ahora ambos son null cuando se resetea
    }
  }, [availableNodes]);

  return (
    <div className="control-panel">
      <h3>Camino Más Corto (Dijkstra)</h3>
      
      {!hasNodes ? (
        <p className="info-message">Agrega nodos primero</p>
      ) : (
        <>
          <div className="form-group">
            <label>
              Nodo Inicial:
              <select 
                value={startNodeId} 
                onChange={(e) => setStartNodeId(e.target.value)}
              >
                <option value="">Selecciona un nodo</option>
                {availableNodes.map(id => (
                  <option key={`start-${id}`} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            </label>
          </div>
          
          <div className="form-group">
            <label>
              Nodo Final:
              <select 
                value={endNodeId} 
                onChange={(e) => setEndNodeId(e.target.value)}
                disabled={!startNodeId}
              >
                <option value="">Selecciona un nodo</option>
                {availableNodes
                  .filter(id => id !== startNodeId)
                  .map(id => (
                    <option key={`end-${id}`} value={id}>
                      {id}
                    </option>
                  ))
                }
              </select>
            </label>
          </div>
          
          <button 
            className="control-btn primary-btn" 
            onClick={findShortestPath}
            disabled={!startNodeId || !endNodeId}
          >
            🔍 Encontrar Camino Más Corto
          </button>
          
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          
          {pathDistance !== null && (
            <div className="result-panel">
              <p>Longitud del camino: <strong>{pathDistance.toFixed(2)}</strong></p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PathFinder;