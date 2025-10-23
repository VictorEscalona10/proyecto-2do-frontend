import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './forgot.password.module.css';

export default function RecuperarContraseña() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!email.includes('@') || !email.includes('.')) {
      newErrors.email = 'Correo electrónico inválido';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/password-reset/forgot-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Se ha enviado un enlace de recuperación a tu correo electrónico.');
      } else {
        setErrors({ submit: data.message || 'Error al enviar el correo de recuperación' });
      }
    } catch (error) {
      setErrors({ submit: 'Error de conexión. Intenta nuevamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formSection}>
        <form onSubmit={handleSubmit} className={styles.recoveryForm}>
          <h2 className={styles.title}>Recuperar Contraseña</h2>
          
          <p className={styles.description}>
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </p>

          {message && (
            <div className={styles.successMessage}>
              ✅ {message}
            </div>
          )}

          {errors.submit && (
            <div className={styles.errorMessage}>
              ⚠️ {errors.submit}
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="email">CORREO ELECTRÓNICO</label>
            <input
              type="email"
              id="email"
              placeholder="Ingresa tu correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              required
              disabled={isLoading}
            />
            {errors.email && (
              <span className={styles.errorText}>{errors.email}</span>
            )}
          </div>

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
          </button>

          <div className={styles.links}>
            <Link to="/login" className={styles.link}>Volver al inicio de sesión</Link>
          </div>
        </form>
      </div>

      <div className={styles.logoSection}>
        <h1 className={styles.logo}>MAGNOLIA<br />TORTAS</h1>
        <p className={styles.est}>EST. 2006</p>
      </div>
    </div>
  );
}