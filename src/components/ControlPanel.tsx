import React, { useState, type ChangeEvent } from 'react';
import type { GraphParams } from '../types/Graph';

interface ControlPanelProps {
  onGenerateGraph: (params: GraphParams) => void;
  onFindPath: (startNode: string, endNode: string) => void;
  availableNodes: string[];
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  onGenerateGraph, 
  onFindPath,
  availableNodes 
}) => {
  const [params, setParams] = useState<GraphParams>({
    num_nodes: 16,
    connectivity: 0.3,
    min_weight: 1,
    max_weight: 10,
    space_size: 100
  });

  const [startNode, setStartNode] = useState<string>('a');
  const [endNode, setEndNode] = useState<string>('p');

  const handleParamChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParams(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };

  const handleGenerate = () => {
    onGenerateGraph(params);
  };

  const handleFindPath = () => {
    onFindPath(startNode, endNode);
  };

  return (
    <div className="control-panel">
      <h3>Configuración del Grafo</h3>
      <div className="control-group">
        <label>
          Número de nodos:
          <input 
            type="range" 
            name="num_nodes" 
            min="2" 
            max="26" 
            value={params.num_nodes} 
            onChange={handleParamChange}
          />
          <span>{params.num_nodes}</span>
        </label>
      </div>
      
      <div className="control-group">
        <label>
          Densidad de conexiones:
          <input 
            type="range" 
            name="connectivity" 
            min="0.1" 
            max="1" 
            step="0.05"
            value={params.connectivity} 
            onChange={handleParamChange}
          />
          <span>{params.connectivity.toFixed(2)}</span>
        </label>
      </div>
      
      <div className="control-group">
        <label>
          Peso mínimo:
          <input 
            type="number" 
            name="min_weight" 
            min="1" 
            max="100" 
            value={params.min_weight} 
            onChange={handleParamChange}
          />
        </label>
      </div>
      
      <div className="control-group">
        <label>
          Peso máximo:
          <input 
            type="number" 
            name="max_weight" 
            min={params.min_weight + 0.1} 
            max="100" 
            value={params.max_weight} 
            onChange={handleParamChange}
          />
        </label>
      </div>
      
      <button className="generate-btn" onClick={handleGenerate}>
        Generar Grafo
      </button>

      <h3>Cálculo de Camino Más Corto</h3>
      {availableNodes.length > 0 ? (
        <>
          <div className="path-controls">
            <div className="control-group">
              <label>
                Nodo inicial:
                <select 
                  value={startNode} 
                  onChange={(e) => setStartNode(e.target.value)}
                >
                  {availableNodes.map(node => (
                    <option key={`start-${node}`} value={node}>{node}</option>
                  ))}
                </select>
              </label>
            </div>
            
            <div className="control-group">
              <label>
                Nodo final:
                <select 
                  value={endNode} 
                  onChange={(e) => setEndNode(e.target.value)}
                >
                  {availableNodes.map(node => (
                    <option key={`end-${node}`} value={node}>{node}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <button className="path-btn" onClick={handleFindPath}>
            Calcular Camino Más Corto
          </button>
        </>
      ) : (
        <p>Genera un grafo primero para calcular caminos</p>
      )}
    </div>
  );
};

export default ControlPanel;