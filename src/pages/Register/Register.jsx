import { useState } from "react";
import styles from "./register.module.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

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
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form with name:", name, "email:", email, "and password:", password);
    
    // Marcar todos los campos como tocados
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
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
        body: JSON.stringify({ name, email, password }),
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
        alert("Registro exitoso! Por favor inicia sesión.");
        // Aquí podrías redirigir al login
      } else {
        console.error("Error en el registro:", data.message || response.statusText);
        setErrors({ submit: data.message || "Error en el registro" });
      }
    } catch (error) {
      console.error("Error en la petición:", error);
      setErrors({ submit: error.message || "Error de conexión" });
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

  return (
    <div className={styles.container}>
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
            <label htmlFor="confirmPassword">REPETIR CONTRASEÑA</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Repite tu contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => handleBlur("confirmPassword")}
              className={`${styles.input} ${errors.confirmPassword && touched.confirmPassword ? styles.inputError : ""}`}
              required
              disabled={isLoading}
            />
            {errors.confirmPassword && touched.confirmPassword && (
              <span className={styles.errorText}>{errors.confirmPassword}</span>
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
            <a href="/login">¿Ya tienes cuenta? Inicia sesión</a>
          </div>
        </form>
      </div>

      <div className={styles.logoSection}>
        <h1 className={styles.logo}>MIGDALIS<br />TORTAS</h1>
        <p className={styles.est}>EST. 2006</p>
      </div>
    </div>
  );
}