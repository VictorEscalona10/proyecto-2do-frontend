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
        role: "ayudante de Cocina",
        description: "amiga de la fundadora, con habilidades en decoración y atención al cliente.",
        emoji: "👩‍🍳"
        },

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
                Más de una década endulzando momentos especiales con amor y dedicación.
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
                Elaborar y ofrecer productos de repostería de la más alta calidad, innovando constantemente en nuestros procesos y utilizando la tecnología como pilar fundamental para optimizar la experiencia de nuestros clientes. Nos proyectamos como una empresa en crecimiento que, manteniendo su esencia artesanal, amplía su alcance a nuevos mercados mediante una sólida presencia digital y fortalece su comunidad a través de la enseñanza de la pastelería.
                </p>
            </div>

            <div className={`${styles.visionCard} ${styles.fadeIn}`}>
                <div className={styles.cardIcon}>🔭</div>
                <h2 className={styles.cardTitle}>Nuestra Visión</h2>
                <p className={styles.cardText}>
                Ser una reposteria muy reconocida en el pais. Visualizamos una empresa con una plataforma web consolidada que nos permita llegar a clientes en todo el territorio nacional, estableciendo alianzas estratégicas y siendo un caso de éxito de transformación digital en el sector gastronómico venezolano.
                </p>
            </div>
            </div>

            {/* Nuestra Historia */}
            <section className={styles.storySection}>
            <h2 className={styles.sectionTitle}>Cómo Comenzó Todo</h2>
            <div className={styles.storyContent}>
                <div className={styles.storyText}>
                <p>
                    Todo comenzó en el año 2008 en la ciudad de La Victoria, Estado Aragua. Lo que hoy es una empresa formal nació de la pasión compartida por la pastelería entre un grupo de amigas. Lo que empezó como un hobby, vendiendo postres de manera informal, se convirtió en la semilla de un sueño empresarial.

                </p>
                <p>
                    Con constancia y un enfoque en la calidad, sus productos comenzaron a ganar el respaldo de una clientela cada vez más fiel.
                </p>
                <p>
                    Este crecimiento orgánico y el boca a boca permitieron que el pequeño emprendimiento se consolidara. Finalmente, tras cuatro años de esfuerzo y dedicación.
                </p>
                <p>
                    En 2012 <strong >Migdalis Tortas</strong> dio el paso crucial para transformarse en una empresa formalmente establecida en el área de postres y repostería, sentando las bases del éxito que disfrutaría en los años siguientes.
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