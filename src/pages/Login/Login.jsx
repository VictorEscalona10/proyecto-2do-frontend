import { useState } from "react";
import styles from "./login.module.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const validate = () => {
    const newErrors = {};
    if (!email.includes("@") || !email.includes(".")) {
      newErrors.email = "Correo inválido";
    }
    if (password.length < 8) {
      newErrors.password = "Contraseña muy corta (mínimo 8 caracteres)";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form with email:", email, "and password:", password);
    
    // Marcar todos los campos como tocados
    setTouched({
      email: true,
      password: true,
    });

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      console.log("Enviando request a:", "http://localhost:3000/auth/login");
      
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // Importante para cookies de autenticación
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries([...response.headers]));

      const responseData = await response.text(); // Primero leer como texto
      console.log("Response data:", responseData);

      let data;
      try {
        data = JSON.parse(responseData); // Intentar parsear como JSON
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        throw new Error("Respuesta del servidor no es JSON válido");
      }

      if (response.ok) {
        console.log("Login exitoso:", data);
        alert("Login exitoso")
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        console.error("Error en el login:", data.message || response.statusText);
        setErrors({ submit: data.message || "Error en el login" });
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
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <h2 className={styles.title}>Inicia Sesion</h2>

          {/* Mostrar error general */}
          {errors.submit && (
            <div className={styles.errorMessage}>
              ⚠️ {errors.submit}
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="email">EMAIL</label>
            <input
              type="email"
              id="email"
              placeholder="Solo Email"
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
              placeholder="Debe tener al menos 8 caracteres"
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

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? "Cargando..." : "Iniciar sesión"}
          </button>

          <div className={styles.links}>
            <a href="/forgot_password">Recuperar contraseña?</a>
            <a href="/register">Crear cuenta</a>
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