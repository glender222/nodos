import React, { useState, useEffect, useRef } from 'react';

interface NodeNameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
  defaultName: string;
  error?: string; // Nueva prop para mostrar el error
}

const NodeNameDialog: React.FC<NodeNameDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  defaultName,
  error
}) => {
  const [nodeName, setNodeName] = useState<string>(defaultName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setNodeName(defaultName);
      inputRef.current.focus();
    }
  }, [isOpen, defaultName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = nodeName.trim();
    if (trimmedName) {
      onConfirm(trimmedName);
    } else {
      onConfirm(defaultName);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="node-name-dialog-overlay">
      <div className="node-name-dialog">
        <h3>Nombre del Nodo</h3>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={nodeName}
            onChange={(e) => setNodeName(e.target.value)}
            placeholder="Introduce nombre del nodo"
          />
          
          {/* Mostrar mensaje de error si existe */}
          {error && <p className="error-message">{error}</p>}
          
          <div className="dialog-buttons">
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit">Aceptar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NodeNameDialog;