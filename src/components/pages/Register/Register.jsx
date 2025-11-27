import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./register.module.css";
import logo from '../../../assest/img/logo.jpg';

export default function Register({ onShowModal }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [identification, setIdentification] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    repeatPassword: false,
    phoneNumber: false,
    identification: false,
  });
  
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }
    
    if (!email.includes("@") || !email.includes(".")) {
      newErrors.email = "Correo inválido";
    }
    
    if (password.length < 8) {
      newErrors.password = "Contraseña muy corta (mínimo 8 caracteres)";
    }
    
    if (password !== repeatPassword) {
      newErrors.repeatPassword = "Las contraseñas no coinciden";
    }
    
    // Validación del número de teléfono con formato específico
    const phoneRegex = /^\+58(412|414|416|424)\d{7}$/;
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "El número de teléfono es obligatorio";
    } else if (!phoneRegex.test(phoneNumber.replace(/\s/g, ""))) {
      newErrors.phoneNumber = "El número debe tener el formato +58412XXXXXXX y comenzar con 412, 414, 416 o 424";
    }
    
    // Validación de identificación (solo números)
    const identificationRegex = /^\d{6,10}$/;
    if (!identification.trim()) {
      newErrors.identification = "El número de identificación es obligatorio";
    } else if (!identificationRegex.test(identification)) {
      newErrors.identification = "La identificación debe contener entre 6 y 10 dígitos";
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form with name:", name, "email:", email, "phone:", phoneNumber, "identification:", identification, "and password:", password);
    
    setTouched({
      name: true,
      email: true,
      password: true,
      repeatPassword: true,
      phoneNumber: true,
      identification: true,
    });

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      console.log("Enviando request a:", "http://localhost:3000/auth/register");
      
      const response = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          repeatPassword, 
          phoneNumber,
          identification: parseInt(identification)
        }), 
      });

      console.log("Response status:", response.status);
      
      const responseData = await response.text();
      console.log("Response data:", responseData);

      let data;
      try {
        data = JSON.parse(responseData);
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        throw new Error("Respuesta del servidor no es JSON válido");
      }

      if (response.ok) {
        console.log("Registro exitoso:", data);
        onShowModal({
          type: 'success',
          message: '¡Registro exitoso! Serás redirigido al login.'
        });
        
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        console.error("Error en el registro:", data.message || response.statusText);
        onShowModal({
          type: 'error',
          message: data.message || "Error en el registro"
        });
      }
    } catch (error) {
      console.error("Error en la petición:", error);
      onShowModal({
        type: 'error',
        message: error.message || "Error de conexión"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    // Validar solo el campo que perdió el foco
    const validationErrors = validate();
    setErrors(validationErrors);
  };

  // Función para formatear el número de teléfono mientras el usuario escribe
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // Remover todo excepto números
    
    // Si empieza a escribir sin +58, lo agregamos automáticamente
    if (value.startsWith("58")) {
      value = "+" + value;
    } else if (!value.startsWith("+58") && value.length > 0) {
      value = "+58" + value;
    }
    
    // Limitar la longitud total a 13 caracteres (+58 + 10 dígitos)
    if (value.length > 13) {
      value = value.substring(0, 13);
    }
    
    setPhoneNumber(value);
  };

  // Función para formatear la identificación (solo números)
  const handleIdentificationChange = (e) => {
    let value = e.target.value;
    
    // Permitir solo números
    value = value.replace(/\D/g, '');
    
    // Limitar la longitud total
    if (value.length > 10) {
      value = value.substring(0, 10);
    }
    
    setIdentification(value);
  };
    // Función para redirigir al home al hacer clic en el logo
  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.formSection}>
          <form onSubmit={handleSubmit} className={styles.registerForm}>
            <h2 className={styles.title}>Registro</h2>

            {/* Mostrar error general */}
            {errors.submit && (
              <div className={styles.errorMessage}>
                ⚠️ {errors.submit}
              </div>
            )}

            <div className={styles.inputGroup}>
              <label htmlFor="name">NOMBRE COMPLETO</label>
              <input
                type="text"
                id="name"
                placeholder="Ingresa tu nombre completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => handleBlur("name")}
                className={`${styles.input} ${errors.name && touched.name ? styles.inputError : ""}`}
                required
                disabled={isLoading}
              />
              {errors.name && touched.name && (
                <span className={styles.errorText}>{errors.name}</span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email">EMAIL</label>
              <input
                type="email"
                id="email"
                placeholder="Email válido"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur("email")}
                className={`${styles.input} ${errors.email && touched.email ? styles.inputError : ""}`}
                required
                disabled={isLoading}
              />
              {errors.email && touched.email && (
                <span className={styles.errorText}>{errors.email}</span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="identification">NÚMERO DE IDENTIFICACIÓN</label>
              <input
                type="text"
                id="identification"
                placeholder="Solo números (6-10 dígitos)"
                value={identification}
                onChange={handleIdentificationChange}
                onBlur={() => handleBlur("identification")}
                className={`${styles.input} ${errors.identification && touched.identification ? styles.inputError : ""}`}
                required
                disabled={isLoading}
              />
              {errors.identification && touched.identification && (
                <span className={styles.errorText}>{errors.identification}</span>
              )}
              
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="phoneNumber">NÚMERO DE TELÉFONO</label>
              <input
                type="tel"
                id="phoneNumber"
                placeholder="+58412XXXXXXX"
                value={phoneNumber}
                onChange={handlePhoneChange}
                onBlur={() => handleBlur("phoneNumber")}
                className={`${styles.input} ${errors.phoneNumber && touched.phoneNumber ? styles.inputError : ""}`}
                required
                disabled={isLoading}
              />
              {errors.phoneNumber && touched.phoneNumber && (
                <span className={styles.errorText}>{errors.phoneNumber}</span>
              )}
              
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password">CONTRASEÑA</label>
              <input
                type="password"
                id="password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur("password")}
                className={`${styles.input} ${errors.password && touched.password ? styles.inputError : ""}`}
                required
                disabled={isLoading}
              />
              {errors.password && touched.password && (
                <span className={styles.errorText}>{errors.password}</span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="repeatPassword">REPETIR CONTRASEÑA</label>
              <input
                type="password"
                id="repeatPassword"
                placeholder="Repite tu contraseña"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                onBlur={() => handleBlur("repeatPassword")}
                className={`${styles.input} ${errors.repeatPassword && touched.repeatPassword ? styles.inputError : ""}`}
                required
                disabled={isLoading}
              />
              {errors.repeatPassword && touched.repeatPassword && (
                <span className={styles.errorText}>{errors.repeatPassword}</span>
              )}
            </div>

            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? "Registrando..." : "CREAR CUENTA"}
            </button>

            <div className={styles.links}>
              <Link to="/login" className={styles.link}>¿Ya tienes cuenta? Inicia sesión</Link>
            </div>
          </form>
        </div>

        <div className={styles.logoSection}>
          <div className={styles.logoContainer}>
            {/* Logo con funcionalidad de click */}
            <img 
              src={logo} 
              alt="Logo Migdalis Tortas" 
              className={styles.logoImage}
              onClick={handleLogoClick}
              style={{ cursor: 'pointer' }}
            />
            <h1 className={styles.logo}>MIGDALIS<br />TORTAS</h1>
            <p className={styles.est}>EST. 2008</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p className={styles.footerText}>
            Repostería "Migdalis Tortas" - Endulzando tus momentos especiales
          </p>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} Migdalis Tortas. Todos los derechos reservados.
          </p>
          <p className={styles.copyright}>
            Diseñado con 💜 para los amantes de la repostería
          </p>
        </div>
      </footer>
    </div>
  );
}