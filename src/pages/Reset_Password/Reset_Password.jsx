import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './Reset.password.module.css';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Obtener el token de la URL
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setErrors({ submit: 'Token de recuperación no válido' });
    }
  }, [searchParams]);

  const validate = () => {
    const newErrors = {};
    
    if (password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setErrors({ submit: 'Token no válido' });
      return;
    }

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      console.log("Enviando nueva contraseña...");
      
      const response = await fetch('http://localhost:3000/auth/reset-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          newPassword: password 
        }),
      });

      console.log("Response status:", response.status);

      const data = await response.json();

      if (response.ok) {
        setMessage('¡Contraseña restablecida exitosamente!');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setErrors({ submit: data.message || 'Error al restablecer la contraseña' });
      }
    } catch (error) {
      console.error("Error:", error);
      setErrors({ submit: 'Error de conexión. Intenta nuevamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token && errors.submit) {
    return (
      <div className={styles.container}>
        <div className={styles.formSection}>
          <div className={styles.errorContainer}>
            <h2>Error</h2>
            <p>{errors.submit}</p>
            <button onClick={() => navigate('/login')} className={styles.backButton}>
              Volver al Login
            </button>
          </div>
        </div>
        
        <div className={styles.logoSection}>
          <h1 className={styles.logo}>MAGNOLIA<br />TORTAS</h1>
          <p className={styles.est}>EST. 2006</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.formSection}>
        <form onSubmit={handleSubmit} className={styles.resetForm}>
          <h2 className={styles.title}>Restablecer Contraseña</h2>
          
          <p className={styles.description}>
            Ingresa tu nueva contraseña. Debe tener al menos 8 caracteres.
          </p>

          {message && (
            <div className={styles.successMessage}>
              ✅ {message}
              <br />
              <small>Serás redirigido al login en 3 segundos...</small>
            </div>
          )}

          {errors.submit && (
            <div className={styles.errorMessage}>
              ⚠️ {errors.submit}
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="password">NUEVA CONTRASEÑA</label>
            <input
              type="password"
              id="password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              required
              disabled={isLoading || !!message}
            />
            {errors.password && (
              <span className={styles.errorText}>{errors.password}</span>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">CONFIRMAR CONTRASEÑA</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Repite tu nueva contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
              required
              disabled={isLoading || !!message}
            />
            {errors.confirmPassword && (
              <span className={styles.errorText}>{errors.confirmPassword}</span>
            )}
          </div>

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isLoading || !!message}
          >
            {isLoading ? 'Restableciendo...' : 'RESTABLECER CONTRASEÑA'}
          </button>

          <div className={styles.links}>
            <button 
              type="button" 
              onClick={() => navigate('/login')} 
              className={styles.backLink}
            >
              ← Volver al inicio de sesión
            </button>
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