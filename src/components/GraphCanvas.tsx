import React, { useRef, useState, useEffect } from 'react';
import { type Graph, type Node, type Edge, type Position } from '../models/GraphModel';

interface GraphCanvasProps {
  graph: Graph;
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string | null) => void;
  highlightedPath: string[] | null;
  onNodePositionChange: (nodeId: string, position: Position) => void;
  onCanvasClick: (position: Position) => void;
  mode: 'view' | 'addNode' | 'addEdge';
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  graph,
  selectedNodeId,
  onNodeSelect,
  highlightedPath,
  onNodePositionChange,
  onCanvasClick,
  mode
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [offset, setOffset] = useState<Position>({ x: 0, y: 0 });

  // Manejar el clic en el canvas
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (mode === 'addNode' && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const position = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      onCanvasClick(position);
    } else if (mode !== 'addEdge') {
      onNodeSelect(null); // Deseleccionar nodo si no estamos en modo de agregar arista
    }
  };

  // Iniciar el arrastre de un nodo
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (mode === 'view') {
      const node = graph.nodes[nodeId];
      setDraggedNodeId(nodeId);
      setOffset({
        x: e.clientX - node.position.x,
        y: e.clientY - node.position.y
      });
      onNodeSelect(nodeId);
    } else if (mode === 'addEdge') {
      onNodeSelect(nodeId);
    }
  };

  // Manejar movimiento del mouse para arrastrar nodos
  const handleMouseMove = (e: MouseEvent) => {
    if (draggedNodeId && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const position = {
        x: e.clientX - offset.x,
        y: e.clientY - offset.y
      };
      // Aplicar límites del canvas
      position.x = Math.max(20, Math.min(position.x, rect.width - 20));
      position.y = Math.max(20, Math.min(position.y, rect.height - 20));
      
      onNodePositionChange(draggedNodeId, position);
    }
  };

  // Finalizar el arrastre de un nodo
  const handleMouseUp = () => {
    setDraggedNodeId(null);
  };

  // Agregar y eliminar event listeners
  useEffect(() => {
    if (draggedNodeId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedNodeId, offset]);

  // Calcular si un arista está en el camino destacado
  const isEdgeHighlighted = (edge: Edge): boolean => {
    if (!highlightedPath) return false;
    
    const sourceIndex = highlightedPath.indexOf(edge.source);
    const targetIndex = highlightedPath.indexOf(edge.target);
    
    if (graph.isDirected) {
      // En grafo direccional, verificar que el origen esté justo antes que el destino
      return sourceIndex !== -1 && targetIndex !== -1 && targetIndex === sourceIndex + 1;
    } else {
      // En grafo bidireccional, verificar que sean adyacentes en cualquier orden
      return sourceIndex !== -1 && 
             targetIndex !== -1 && 
             Math.abs(sourceIndex - targetIndex) === 1;
    }
  };

  // Función para dibujar una línea curva entre nodos
  const getEdgePath = (sourceNode: Node, targetNode: Node): string => {
    const dx = targetNode.position.x - sourceNode.position.x;
    const dy = targetNode.position.y - sourceNode.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Para líneas cortas, hacerlas más curvas
    const curvature = Math.min(0.2, 30 / distance);
    
    // Punto de control para la curva
    const midX = (sourceNode.position.x + targetNode.position.x) / 2;
    const midY = (sourceNode.position.y + targetNode.position.y) / 2;
    
    // Perpendicular a la línea recta
    const nx = -dy;
    const ny = dx;
    
    // Punto de control desplazado
    const controlX = midX + nx * curvature;
    const controlY = midY + ny * curvature;
    
    return `M ${sourceNode.position.x} ${sourceNode.position.y} Q ${controlX} ${controlY} ${targetNode.position.x} ${targetNode.position.y}`;
  };

  // Posición para el texto del peso
  const getEdgeLabelPosition = (sourceNode: Node, targetNode: Node): Position => {
    const path = getEdgePath(sourceNode, targetNode);
    // Extraer el punto de control Q
    const matches = path.match(/Q\s+(\d+\.?\d*)\s+(\d+\.?\d*)/);
    if (matches && matches.length >= 3) {
      return {
        x: parseFloat(matches[1]),
        y: parseFloat(matches[2])
      };
    }
    
    // Fallback al punto medio si no podemos extraer el punto de control
    return {
      x: (sourceNode.position.x + targetNode.position.x) / 2,
      y: (sourceNode.position.y + targetNode.position.y) / 2 - 10
    };
  };

  // Calcular las coordenadas de la flecha
  const calculateArrowPoints = (sourcePos: Position, targetPos: Position): string => {
    // Definir longitud y ancho de la punta de flecha
    const arrowLength = 10;
    const arrowWidth = 6;
    
    // Calcular el ángulo de la línea
    const angle = Math.atan2(targetPos.y - sourcePos.y, targetPos.x - sourcePos.x);
    
    // Calcular la posición de la punta de flecha (un poco antes del nodo destino)
    const nodeRadius = 20; // Radio aproximado del nodo
    const distance = Math.sqrt(Math.pow(targetPos.x - sourcePos.x, 2) + Math.pow(targetPos.y - sourcePos.y, 2));
    const ratio = (distance - nodeRadius) / distance;
    
    const tipX = sourcePos.x + (targetPos.x - sourcePos.x) * ratio;
    const tipY = sourcePos.y + (targetPos.y - sourcePos.y) * ratio;
    
    // Calcular los puntos de la base de la flecha
    const x1 = tipX - arrowLength * Math.cos(angle - Math.PI/6);
    const y1 = tipY - arrowLength * Math.sin(angle - Math.PI/6);
    const x2 = tipX - arrowLength * Math.cos(angle + Math.PI/6);
    const y2 = tipY - arrowLength * Math.sin(angle + Math.PI/6);
    
    return `${tipX},${tipY} ${x1},${y1} ${x2},${y2}`;
  };

  return (
    <div 
      className="graph-canvas"
      ref={canvasRef}
      onClick={handleCanvasClick}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#282c34',
        overflow: 'hidden',
        cursor: mode === 'addNode' ? 'crosshair' : 'default'
      }}
    >
      {/* SVG para dibujar las conexiones */}
      <svg 
        width="100%" 
        height="100%" 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none'
        }}
      >
        {graph.edges.map(edge => {
          const sourceNode = graph.nodes[edge.source];
          const targetNode = graph.nodes[edge.target];
          const highlighted = isEdgeHighlighted(edge);
          
          if (!sourceNode || !targetNode) return null;
          
          const path = getEdgePath(sourceNode, targetNode);
          const labelPosition = getEdgeLabelPosition(sourceNode, targetNode);
          const arrowPoints = graph.isDirected ? calculateArrowPoints(sourceNode.position, targetNode.position) : null;
          
          return (
            <g key={edge.id}>
              <path
                d={path}
                stroke={highlighted ? '#ff5252' : '#aaaaaa'}
                strokeWidth={highlighted ? 3 : 2}
                fill="none"
              />
              {/* Flecha para grafos direccionales */}
              {graph.isDirected && arrowPoints && (
                <polygon
                  points={arrowPoints}
                  fill={highlighted ? '#ff5252' : '#aaaaaa'}
                />
              )}
              <circle 
                cx={labelPosition.x} 
                cy={labelPosition.y} 
                r={12}
                fill="#4a4a4a"
                opacity={0.8}
              />
              <text
                x={labelPosition.x}
                y={labelPosition.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize={12}
                fontWeight={highlighted ? 'bold' : 'normal'}
              >
                {edge.weight.toFixed(1)}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Nodos */}
      {Object.values(graph.nodes).map(node => {
        const isSelected = node.id === selectedNodeId;
        const isHighlighted = highlightedPath?.includes(node.id) || false;
        const isDragged = node.id === draggedNodeId;
        
        let nodeStyle: React.CSSProperties = {
          position: 'absolute',
          left: `${node.position.x - 20}px`,
          top: `${node.position.y - 20}px`,
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: mode === 'view' ? 'move' : 'pointer',
          backgroundColor: node.color || '#6d83f2',
          boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
          border: '2px solid transparent',
          transition: isDragged ? 'none' : 'all 0.2s ease',
          zIndex: isSelected || isDragged ? 10 : 1
        };

        if (isSelected) {
          nodeStyle.border = '2px solid #ffcc00';
          nodeStyle.boxShadow = '0 0 10px rgba(255,204,0,0.6)';
        }
        
        if (isHighlighted) {
          nodeStyle.backgroundColor = '#ff5252';
          nodeStyle.boxShadow = '0 0 10px rgba(255,82,82,0.6)';
        }

        return (
          <div
            key={node.id}
            style={nodeStyle}
            onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
            onContextMenu={(e) => {
              e.preventDefault();
              // Aquí podríamos mostrar un menú contextual
            }}
          >
            <div style={{
              color: isHighlighted ? 'white' : '#222',
              fontWeight: 'bold'
            }}>
              {node.label}
            </div>
          </div>
        );
      })}

      {/* Indicador del modo actual */}
      {mode === 'addNode' && (
        <div className="mode-indicator" style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0,0,0,0.6)',
          color: '#2ecc71',
          padding: '5px 15px',
          borderRadius: '15px',
          pointerEvents: 'none'
        }}>
          Haz clic para añadir un nodo
        </div>
      )}
      
      {mode === 'addEdge' && (
        <div className="mode-indicator" style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0,0,0,0.6)',
          color: '#3498db',
          padding: '5px 15px',
          borderRadius: '15px',
          pointerEvents: 'none'
        }}>
          {selectedNodeId 
            ? 'Selecciona otro nodo para conectar' 
            : 'Selecciona el nodo de origen'}
        </div>
      )}
    </div>
  );
};

export default GraphCanvas;