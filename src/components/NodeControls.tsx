import React, { useState } from 'react';

interface NodeControlsProps {
  onAddNode: () => void;
  onRemoveNode: () => void;
  selectedNodeId: string | null;
  nodeCount: number;
  isAddingNode: boolean;
}

const NodeControls: React.FC<NodeControlsProps> = ({ 
  onAddNode, 
  onRemoveNode, 
  selectedNodeId,
  nodeCount,
  isAddingNode
}) => {
  return (
    <div className="control-panel">
      <h3>Nodos ({nodeCount})</h3>
      
      <button 
        className={`control-btn add-btn ${isAddingNode ? 'active' : ''}`}
        onClick={onAddNode}
      >
        {isAddingNode ? '✓ Colocando Nodo' : '+ Agregar Nodo'}
      </button>
      
      <button 
        className="control-btn delete-btn"
        onClick={onRemoveNode}
        disabled={!selectedNodeId}
      >
        - Eliminar Nodo Seleccionado
      </button>
      
      {selectedNodeId && (
        <div className="node-info">
          <p>Nodo seleccionado: <strong>{selectedNodeId}</strong></p>
        </div>
      )}
    </div>
  );
};

export default NodeControls;