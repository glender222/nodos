import React from 'react';

interface GraphTypeToggleProps {
  isDirected: boolean;
  onToggle: (isDirected: boolean) => void;
}

const GraphTypeToggle: React.FC<GraphTypeToggleProps> = ({ isDirected, onToggle }) => {
  return (
    <div className="control-panel">
      <h3>Tipo de Grafo</h3>
      
      <div className="toggle-container">
        <button 
          className={`toggle-btn ${!isDirected ? 'active' : ''}`} 
          onClick={() => onToggle(false)}
          title="Las conexiones funcionan en ambas direcciones"
        >
          Bidireccional
        </button>
        <button 
          className={`toggle-btn ${isDirected ? 'active' : ''}`}
          onClick={() => onToggle(true)}
          title="Las conexiones solo van del origen al destino"
        >
          Direccional
        </button>
      </div>

      <div className="info-message">
        <p>
          <strong>Modo actual:</strong> {isDirected ? 'Direccional' : 'Bidireccional'}
        </p>
        <p className="hint">
          {isDirected 
            ? 'Las conexiones tienen una dirección específica (A→B)' 
            : 'Las conexiones funcionan en ambas direcciones (A↔B)'}
        </p>
      </div>
    </div>
  );
};

export default GraphTypeToggle;