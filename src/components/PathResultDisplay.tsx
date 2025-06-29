import React from 'react';
import type { PathResult } from '../types/Graph';

interface PathResultDisplayProps {
  pathResult: PathResult | null;
}

// Renombrado para evitar conflicto con el tipo PathResult
const PathResultDisplay: React.FC<PathResultDisplayProps> = ({ pathResult }) => {
  if (!pathResult) {
    return null;
  }

  return (
    <div className="path-result">
      {pathResult.exists ? (
        <>
          <h3>Camino más corto:</h3>
          <div className="path">
            {pathResult.path?.join(' → ')}
          </div>
          <div className="length">
            Longitud total: {pathResult.length.toFixed(2)}
          </div>
        </>
      ) : (
        <div className="no-path">
          No existe un camino entre los nodos seleccionados.
        </div>
      )}
    </div>
  );
};

export default PathResultDisplay;