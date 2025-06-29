import React, { useState, useEffect } from 'react';

interface EdgeControlsProps {
  onAddEdge: (source: string, target: string, weight: number) => void;
  onStartEdgeCreation: () => void;
  availableNodes: string[];
  selectedNodeId: string | null;
  isAddingEdge: boolean;
}

const EdgeControls: React.FC<EdgeControlsProps> = ({ 
  onAddEdge,
  onStartEdgeCreation,
  availableNodes, 
  selectedNodeId,
  isAddingEdge
}) => {
  const [sourceNodeId, setSourceNodeId] = useState<string>('');
  const [targetNodeId, setTargetNodeId] = useState<string>('');
  const [weight, setWeight] = useState<number>(1);
  const [error, setError] = useState<string>('');

  // Actualizar el nodo fuente cuando cambia la selección
  useEffect(() => {
    if (selectedNodeId && isAddingEdge) {
      if (sourceNodeId === '') {
        setSourceNodeId(selectedNodeId);
      } else if (sourceNodeId !== selectedNodeId && targetNodeId === '') {
        setTargetNodeId(selectedNodeId);
      }
    }
  }, [selectedNodeId, isAddingEdge]);

  // Crear la conexión cuando se seleccionan ambos nodos en modo visual
  useEffect(() => {
    if (isAddingEdge && sourceNodeId && targetNodeId) {
      try {
        onAddEdge(sourceNodeId, targetNodeId, weight);
        // Resetear después de crear la conexión
        setSourceNodeId('');
        setTargetNodeId('');
        setError('');
      } catch (e) {
        setError((e as Error).message);
        // Resetear sólo el nodo destino para intentar otra conexión
        setTargetNodeId('');
      }
    }
  }, [sourceNodeId, targetNodeId, isAddingEdge]);

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setWeight(value);
    }
  };

  const handleAddEdgeClick = () => {
    onStartEdgeCreation();
    setSourceNodeId('');
    setTargetNodeId('');
    setError('');
  };

  return (
    <div className="control-panel">
      <h3>Conexiones</h3>
      
      <div className="form-group">
        <label>
          Peso de la conexión:
          <input 
            type="number" 
            value={weight}
            min={0.1}
            step={0.1}
            onChange={handleWeightChange}
          />
        </label>
      </div>
      
      <button 
        className={`control-btn connect-btn ${isAddingEdge ? 'active' : ''}`}
        onClick={handleAddEdgeClick}
      >
        {isAddingEdge ? '✓ Conectando Nodos' : '↔ Conectar Nodos'}
      </button>
      
      {error && <p className="error-message">{error}</p>}
      
      <div className="edge-creation-help">
        <p>
          <strong>Modo conexión:</strong> 
          {isAddingEdge 
            ? ' Selecciona dos nodos para conectar' 
            : ' Haz clic en el botón para iniciar'}
        </p>
      </div>
    </div>
  );
};

export default EdgeControls;