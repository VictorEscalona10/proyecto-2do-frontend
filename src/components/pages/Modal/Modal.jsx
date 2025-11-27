import './Modal.module.css'; // Cambia esto - sin el 'default'

export default function Modal({ type = 'info', message, onConfirm, onClose }) {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const getHeaderClass = () => {
    switch (type) {
      case 'success': return 'modalHeaderSuccess';
      case 'error': return 'modalHeaderError';
      case 'warning': return 'modalHeaderWarning';
      case 'confirm': return 'modalHeaderConfirm';
      default: return '';
    }
  };

  return (
    <div className="modalOverlay">
      <div className="modalContent">
        <div className={`modalHeader ${getHeaderClass()}`}>
          <h3>
            {type === 'success' && '✅ Éxito'}
            {type === 'error' && '❌ Error'}
            {type === 'warning' && '⚠️ Advertencia'}
            {type === 'confirm' && '❓ Confirmación'}
            {type === 'info' && 'ℹ️ Información'}
          </h3>
          <button className="closeBtn" onClick={onClose}>×</button>
        </div>
        
        <div className="modalBody">
          {message}
        </div>
        
        <div className="modalFooter">
          {type === 'confirm' ? (
            <>
              <button className="modalBtn cancelBtn" onClick={onClose}>
                Cancelar
              </button>
              <button className="modalBtn confirmBtn" onClick={handleConfirm}>
                Confirmar
              </button>
            </>
          ) : (
            <button className="modalBtn okBtn" onClick={onClose}>
              Aceptar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}