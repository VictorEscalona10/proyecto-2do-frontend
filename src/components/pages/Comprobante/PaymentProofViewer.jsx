import React, { useState, useEffect } from 'react';
import './PaymentProofViewer.css';

export function PaymentProofViewer({ orderId }) {
  const API_URL = import.meta.env.VITE_API_URL;
  const [proofUrl, setProofUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPaymentProof = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/orders/${orderId}/payment-proof`, {
          method: 'GET',
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setProofUrl(data.proofUrl);
      } catch (err) {
        console.error('Error fetching payment proof:', err);
        setError('No se pudo cargar el comprobante de pago');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchPaymentProof();
    }
  }, [orderId, API_URL]);

  if (loading) {
    return (
      <div className="proof-loading">
        <div className="loading-spinner"></div>
        <p>Cargando comprobante...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="proof-error">
        <span className="error-icon">⚠️</span>
        <span className="error-text">{error}</span>
      </div>
    );
  }

  if (!proofUrl) {
    return (
      <div className="proof-empty">
        <span className="empty-icon">📄</span>
        <span className="empty-text">No hay comprobante de pago</span>
      </div>
    );
  }

  return (
    <div className="payment-proof-viewer">
      <div className="proof-header">
        <h4>📸 Comprobante de Pago</h4>
        <a 
          href={proofUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="proof-download-link"
          download={`comprobante-orden-${orderId}.jpg`}
        >
          ⬇️ Descargar
        </a>
      </div>
      
      <div className="proof-image-container">
        <img 
          src={proofUrl} 
          alt={`Comprobante de pago orden #${orderId}`}
          className="proof-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/image-error.png';
            setError('No se pudo cargar la imagen. La URL puede haber expirado.');
          }}
        />
      </div>
      
      <div className="proof-footer">
        <p className="proof-note">
          <small>ℹ️ Esta URL expirará en 1 hora. Si necesitas verla después, recarga la página.</small>
        </p>
      </div>
    </div>
  );
}