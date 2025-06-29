import React, { useState, useEffect } from 'react';
import { type DijkstraResult } from '../models/GraphModel';

interface PathFinderProps {
  availableNodes: string[]; // Representa las etiquetas de los nodos
  nodeIdMap: Record<string, string>; // Mapa de etiqueta -> ID
  onFindPath: (startNodeId: string, endNodeId: string) => DijkstraResult;
  onPathFound: (path: string[] | null, distance: number | null) => void;
}

const PathFinder: React.FC<PathFinderProps> = ({ 
  availableNodes, 
  nodeIdMap,
  onFindPath,
  onPathFound
}) => {
  const [startNodeLabel, setStartNodeLabel] = useState<string>('');
  const [endNodeLabel, setEndNodeLabel] = useState<string>('');
  const [pathDistance, setPathDistance] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const hasNodes = availableNodes.length > 0;

  // Función para traducir las etiquetas a IDs antes de buscar el camino
  const findShortestPath = () => {
    if (!startNodeLabel || !endNodeLabel) {
      setErrorMessage('Selecciona los nodos de inicio y fin');
      return;
    }

    if (startNodeLabel === endNodeLabel) {
      setErrorMessage('Los nodos de inicio y fin deben ser diferentes');
      return;
    }

    try {
      // Obtener los IDs internos a partir de las etiquetas
      const startNodeId = nodeIdMap[startNodeLabel];
      const endNodeId = nodeIdMap[endNodeLabel];
      
      if (!startNodeId || !endNodeId) {
        setErrorMessage('No se pueden encontrar los IDs de los nodos seleccionados');
        return;
      }

      // Ejecutar el algoritmo de Dijkstra con los IDs correctos
      const result = onFindPath(startNodeId, endNodeId);
      
      if (!result.path) {
        setErrorMessage(`No existe un camino desde ${startNodeLabel} hasta ${endNodeLabel}`);
        onPathFound(null, null);
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
    if (availableNodes.length > 0 && !availableNodes.includes(startNodeLabel)) {
      setStartNodeLabel('');
    }
    if (availableNodes.length > 0 && !availableNodes.includes(endNodeLabel)) {
      setEndNodeLabel('');
    }
    if (startNodeLabel === '' || endNodeLabel === '') {
      setPathDistance(null);
      onPathFound(null, null);
    }
  }, [availableNodes, startNodeLabel, endNodeLabel, onPathFound]);

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
                value={startNodeLabel} 
                onChange={(e) => setStartNodeLabel(e.target.value)}
              >
                <option value="">Selecciona un nodo</option>
                {availableNodes.map(label => (
                  <option key={`start-${label}`} value={label}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          
          <div className="form-group">
            <label>
              Nodo Final:
              <select 
                value={endNodeLabel} 
                onChange={(e) => setEndNodeLabel(e.target.value)}
                disabled={!startNodeLabel}
              >
                <option value="">Selecciona un nodo</option>
                {availableNodes
                  .filter(label => label !== startNodeLabel)
                  .map(label => (
                    <option key={`end-${label}`} value={label}>
                      {label}
                    </option>
                  ))
                }
              </select>
            </label>
          </div>
          
          <button 
            className="control-btn primary-btn" 
            onClick={findShortestPath}
            disabled={!startNodeLabel || !endNodeLabel}
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