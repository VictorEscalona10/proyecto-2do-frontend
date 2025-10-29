import styles from './About.module.css';

export default function about() {
  // Datos del equipo
    const teamMembers = [
        {
        id: 1,
        name: "Migdalis Pérez",
        role: "Fundadora & Chef Principal",
        description: "Con más de 15 años de experiencia en repostería artesanal. Especialista en tortas personalizadas y postres gourmet.",
        emoji: "👩‍🍳"
        },
        {
        id: 2,
        name: "Carlos Rodríguez",
        role: "Co-Fundador & Gerente",
        description: "Encargado de la administración y logística. Asegura que cada pedido llegue perfecto a su destino.",
        emoji: "💼"
        },
        {
        id: 3,
        name: "Ana Martínez",
        role: "Pastelera Creativa",
        description: "Artista en decoración de postres. Crea diseños únicos que hacen de cada torta una obra de arte.",
        emoji: "🎨"
        }
    ];

    // Valores de la empresa
    const companyValues = [
        {
        id: 1,
        title: "Calidad Premium",
        description: "Usamos solo los mejores ingredientes naturales y frescos en todas nuestras preparaciones.",
        emoji: "⭐"
        },
        {
        id: 2,
        title: "Creatividad",
        description: "Cada diseño es único y personalizado según los sueños y preferencias de nuestros clientes.",
        emoji: "✨"
        },
        {
        id: 3,
        title: "Pasión",
        description: "Amamos lo que hacemos y ponemos el corazón en cada postre que creamos.",
        emoji: "❤️"
        },
        {
        id: 4,
        title: "Compromiso",
        description: "Cumplimos con los más altos estándares de higiene y puntualidad en cada entrega.",
        emoji: "🤝"
        }
    ];

    return (
        <div className={styles.aboutContainer}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
            <div className={styles.heroOverlay}>
            <h1 className={styles.heroTitle}>Nuestra Historia</h1>
            <p className={styles.heroSubtitle}>
                Más de una década endulzando momentos especiales con amor y dedicación
            </p>
            </div>
        </section>

        {/* Main Content */}
        <div className={styles.contentSection}>
            
            {/* Misión y Visión */}
            <div className={styles.missionVision}>
            <div className={`${styles.missionCard} ${styles.fadeIn}`}>
                <div className={styles.cardIcon}>🎯</div>
                <h2 className={styles.cardTitle}>Nuestra Misión</h2>
                <p className={styles.cardText}>
                Crear experiencias dulces inolvidables mediante postres artesanales de la más alta calidad, 
                elaborados con ingredientes premium y mucho amor. Queremos ser parte de tus momentos más especiales, 
                endulzando cada celebración con sabor y creatividad.
                </p>
            </div>

            <div className={`${styles.visionCard} ${styles.fadeIn}`}>
                <div className={styles.cardIcon}>🔭</div>
                <h2 className={styles.cardTitle}>Nuestra Visión</h2>
                <p className={styles.cardText}>
                Ser la repostería de referencia en la región, reconocida por nuestra innovación, 
                calidad excepcional y servicio personalizado. Aspiramos a expandir la alegría que 
                brindamos a través de nuevas sucursales mientras mantenemos nuestra esencia artesanal.
                </p>
            </div>
            </div>

            {/* Nuestra Historia */}
            <section className={styles.storySection}>
            <h2 className={styles.sectionTitle}>Cómo Comenzó Todo</h2>
            <div className={styles.storyContent}>
                <div className={styles.storyText}>
                <p>
                    <strong>Migdalis Tortas</strong> nació en 2010 como un sueño en la cocina de nuestra fundadora, 
                    Migdalis Pérez. Lo que comenzó haciendo pasteles para familiares y amigos pronto se convirtió 
                    en una pasión que no podía contener.
                </p>
                <p>
                    Con solo un horno convencional y recetas heredadas de su abuela, Migdalis empezó a recibir 
                    pedidos de vecinos y conocidos. La fama de sus "tortas que saben a amor" se extendió rápidamente.
                </p>
                <p>
                    Hoy, después de más de 13 años, hemos crecido pero mantenemos nuestra esencia: cada postre 
                    sigue siendo elaborado artesanalmente, con la misma dedicación y amor del primer día.
                </p>
                <p>
                    Hemos sido parte de más de <strong>5,000 celebraciones</strong>, desde pequeñas reuniones 
                    familiares hasta grandes bodas y eventos corporativos.
                </p>
                </div>
                <div className={styles.storyImage}>
                🎂
                </div>
            </div>
            </section>

            {/* Valores */}
            <section className={styles.valuesSection}>
            <h2 className={styles.sectionTitle}>Nuestros Valores</h2>
            <div className={styles.valuesGrid}>
                {companyValues.map(value => (
                <div key={value.id} className={styles.valueCard}>
                    <div className={styles.valueIcon}>{value.emoji}</div>
                    <h3 className={styles.valueTitle}>{value.title}</h3>
                    <p className={styles.valueDescription}>{value.description}</p>
                </div>
                ))}
            </div>
            </section>

            {/* Equipo */}
            <section className={styles.teamSection}>
            <h2 className={styles.sectionTitle}>Nuestro Equipo</h2>
            <div className={styles.teamGrid}>
                {teamMembers.map(member => (
                <div key={member.id} className={styles.teamMember}>
                    <div className={styles.memberPhoto}>
                    {member.emoji}
                    </div>
                    <h3 className={styles.memberName}>{member.name}</h3>
                    <p className={styles.memberRole}>{member.role}</p>
                    <p className={styles.memberDescription}>{member.description}</p>
                </div>
                ))}
            </div>
            </section>

            {/* Información de Contacto */}
            <section className={styles.contactSection}>
            <h2 className={styles.contactTitle}>¿Listo para Endulzar tu Evento?</h2>
            <div className={styles.contactInfo}>
                <div className={styles.contactItem}>
                <span className={styles.contactIcon}>📞</span>
                <span>+57 300 123 4567</span>
                </div>
                <div className={styles.contactItem}>
                <span className={styles.contactIcon}>📧</span>
                <span>hola@migdalistortas.com</span>
                </div>
                <div className={styles.contactItem}>
                <span className={styles.contactIcon}>📍</span>
                <span>Calle Dulce 123, Ciudad Dulce</span>
                </div>
                <div className={styles.contactItem}>
                <span className={styles.contactIcon}>🕒</span>
                <span>Lun-Sáb: 8:00 AM - 6:00 PM</span>
                </div>
            </div>
            <p style={{fontStyle: 'italic', opacity: 0.9}}>
                "Endulzamos tus momentos, creamos tus recuerdos"
            </p>
            </section>
        </div>
        </div>
    );
    }