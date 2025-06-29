import React from 'react';
import type { PathResult as PathResultType } from '../types/Graph';

interface PathResultProps {
  pathResult: PathResultType | null;
}

const PathResult: React.FC<PathResultProps> = ({ pathResult }) => {
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

export default PathResult;