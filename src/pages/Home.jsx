import { useState } from "react";
import { useNavigate } from "react-router-dom";

const COURSES = [
  {
    id: "ia-engine-overview",
    title: "IA Engine — Visão Geral",
    description: "Arquitectura, modelos core, fluxo de execução e integrações da plataforma.",
    tags: ["task_engine", "api_engine", "Celery"],
    status: "available",
    path: "/ia-engine-overview",
    sections: 6,
    quizzes: 30,
  },
  {
    id: "task-engine",
    title: "Como criar uma Automação",
    description: "Scripts, Schedules, Actions, Tickets e o ciclo de vida completo das automações agendadas.",
    tags: ["task_engine", "Celery", "Cron", "Tickets"],
    status: "available",
    path: "/task-engine",
    sections: 6,
    quizzes: 35,
  },
  {
    id: "api-function-service",
    title: "Como criar uma API",
    description: "Aprende a estrutura de um script FunctionService — do main(**kwargs) ao Pydantic BaseModel.",
    tags: ["api_engine", "FunctionService", "Pydantic"],
    status: "available",
    path: "/api-function-service",
    sections: 6,
    quizzes: 28,
  },
  {
    id: "sql-etl",
    title: "SQL Server & ETL",
    description: "Views, stored procedures, MERGE statements e pipelines de dados no BIADDO.",
    tags: ["SQL Server", "ETL", "BIADDO"],
    status: "available",
    path: "/sql-etl",
    sections: 6,
    quizzes: 34,
  },
  {
    id: "integracoes",
    title: "Integrações Externas",
    description: "Odoo XML-RPC, Meilisearch, Teams, VTEX e outras integrações da plataforma.",
    tags: ["Odoo", "Meilisearch", "Teams", "VTEX"],
    status: "available",
    path: "/integracoes",
    sections: 6,
    quizzes: 33,
  },
  {
    id: "agent-engine",
    title: "Agent Engine — Agentes IA",
    description: "Google ADK, LiteLLM, integração com o agent_app e configuração de agentes no IA Engine.",
    tags: ["agent_engine", "Google ADK", "LiteLLM", "FastAPI"],
    status: "coming-soon",
    path: null,
    sections: null,
    quizzes: null,
  },
  {
    id: "django-celery",
    title: "Django & Celery",
    description: "Settings com split-settings, modelos Django, admin, migrações, workers Celery, filas e retries.",
    tags: ["Django", "Celery", "Migrações", "Admin"],
    status: "coming-soon",
    path: null,
    sections: null,
    quizzes: null,
  },
  {
    id: "padroes-python",
    title: "Padrões Python nos Scripts",
    description: "DatabaseWrapper, tratamento de erros, logging para Teams, padrão if __name__ e boas práticas.",
    tags: ["Python", "Boas Práticas", "Wrapper", "ENV"],
    status: "coming-soon",
    path: null,
    sections: null,
    quizzes: null,
  },
  {
    id: "docker-deploy",
    title: "Docker & Deploy",
    description: "Docker Compose, serviços, variáveis de ambiente, deploy em produção e restart de serviços.",
    tags: ["Docker", "Compose", "Deploy", "Produção"],
    status: "coming-soon",
    path: null,
    sections: null,
    quizzes: null,
  },
];

export default function Home() {
  const [hoveredId, setHoveredId] = useState(null);
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    if (path) navigate(path);
  };

  return (
    <div style={styles.page}>
      <div style={styles.bgGrain} />

      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <img
            src="https://nossafarmacia.vtexassets.com/assets/vtex.file-manager-graphql/images/f432f301-b5fa-4453-aa24-22ea02396e16___13e59f7056915bc23b198375758778f6.png"
            alt="Nossa Farmácia"
            style={styles.logo}
          />
          <div style={styles.badge}>DEVTEAM · Plataforma de Estudo</div>
          <h1 style={styles.h1}>
            IA Engine <em style={styles.em}>Academy</em>
          </h1>
          <p style={styles.subtitle}>
            Guias interactivos com teoria e quizzes para a equipa de
            desenvolvimento Nossa Farmácia / Addo Pharma.
          </p>
          <div style={styles.stats}>
            <div style={styles.stat}>
              <span style={styles.statNum}>
                {COURSES.filter((c) => c.status === "available").length}
              </span>
              <span style={styles.statLabel}>Cursos disponíveis</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.stat}>
              <span style={styles.statNum}>
                {COURSES.filter((c) => c.status === "available").reduce(
                  (a, c) => a + (c.quizzes || 0),
                  0
                )}
              </span>
              <span style={styles.statLabel}>Perguntas de quiz</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.stat}>
              <span style={styles.statNum}>
                {COURSES.filter((c) => c.status === "coming-soon").length}
              </span>
              <span style={styles.statLabel}>Em breve</span>
            </div>
          </div>
        </div>
      </header>

      {/* COURSES GRID */}
      <main style={styles.main}>
        <div style={styles.sectionLabel}>Cursos</div>
        <div style={styles.grid}>
          {COURSES.map((course) => {
            const isHovered = hoveredId === course.id;
            const isAvailable = course.status === "available";
            return (
              <div
                key={course.id}
                style={{
                  ...styles.card,
                  ...(isHovered && isAvailable ? styles.cardHover : {}),
                  ...(! isAvailable ? styles.cardDisabled : {}),
                  cursor: isAvailable ? "pointer" : "default",
                }}
                onMouseEnter={() => setHoveredId(course.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => isAvailable && handleNavigate(course.path)}
              >
                {/* Status badge */}
                <div
                  style={{
                    ...styles.cardBadge,
                    ...(isAvailable
                      ? styles.cardBadgeAvailable
                      : styles.cardBadgeSoon),
                  }}
                >
                  {isAvailable ? "Disponível" : "Em breve"}
                </div>

                {/* Title */}
                <h2 style={styles.cardTitle}>{course.title}</h2>

                {/* Description */}
                <p style={styles.cardDesc}>{course.description}</p>

                {/* Tags */}
                <div style={styles.tags}>
                  {course.tags.map((tag) => (
                    <span key={tag} style={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                {isAvailable && (
                  <div style={styles.cardFooter}>
                    <span style={styles.cardMeta}>
                      {course.sections} secções
                    </span>
                    <span style={styles.cardMetaDot}>·</span>
                    <span style={styles.cardMeta}>
                      {course.quizzes} perguntas
                    </span>
                    <span
                      style={{
                        ...styles.cardArrow,
                        ...(isHovered ? styles.cardArrowHover : {}),
                      }}
                    >
                      →
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <img
          src="https://nossafarmacia.vtexassets.com/assets/vtex.file-manager-graphql/images/f432f301-b5fa-4453-aa24-22ea02396e16___13e59f7056915bc23b198375758778f6.png"
          alt="Nossa Farmácia"
          style={styles.footerLogo}
        />
        <span>DEVTEAM — Nossa Farmácia / Addo Pharma</span>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════
// STYLES
// ═══════════════════════════════════════
const primary = "oklch(0.5960 0.1450 163.2250)";
const primaryFg = "oklch(0.9850 0 0)";
const bg = "oklch(0.9670 0.0030 264.5420)";
const card = "oklch(0.9850 0 0)";
const border = "oklch(0.9220 0 0)";
const fg = "oklch(0.1450 0 0)";
const muted = "oklch(0.5560 0 0)";
const accent = "oklch(0.9820 0.0180 155.8260)";
const secondary = "oklch(0.9700 0 0)";
const radius = "0.625rem";

const styles = {
  page: {
    minHeight: "100vh",
    background: bg,
    fontFamily:
      "'DM Sans', ui-sans-serif, system-ui, -apple-system, sans-serif",
    color: fg,
    position: "relative",
    WebkitFontSmoothing: "antialiased",
  },
  bgGrain: {
    position: "fixed",
    inset: 0,
    opacity: 0.03,
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
    backgroundRepeat: "repeat",
    backgroundSize: "256px",
    pointerEvents: "none",
    zIndex: 0,
  },
  header: {
    position: "relative",
    zIndex: 1,
    padding: "4rem 2rem 3rem",
    textAlign: "center",
    background: `linear-gradient(165deg, ${card} 0%, ${accent} 100%)`,
    borderBottom: `1px solid ${border}`,
  },
  headerInner: { maxWidth: 640, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center" },
  logo: {
    height: 120,
    marginBottom: "1.2rem",
    objectFit: "contain",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    padding: "0.3rem 0.9rem",
    background: primary,
    color: primaryFg,
    borderRadius: 100,
    fontSize: "0.7rem",
    fontWeight: 600,
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    marginBottom: "1.2rem",
  },
  h1: {
    fontFamily: "'Fraunces', serif",
    fontSize: "clamp(2rem, 5vw, 3.2rem)",
    fontWeight: 700,
    letterSpacing: "-0.025em",
    lineHeight: 1.1,
    marginBottom: "0.7rem",
  },
  em: { fontStyle: "italic", color: primary },
  subtitle: {
    color: muted,
    fontSize: "0.95rem",
    lineHeight: 1.6,
    maxWidth: 460,
    margin: "0 auto 2rem",
  },
  stats: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "1.5rem",
    flexWrap: "wrap",
  },
  stat: { display: "flex", flexDirection: "column", alignItems: "center" },
  statNum: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "1.6rem",
    fontWeight: 700,
    color: primary,
  },
  statLabel: {
    fontSize: "0.7rem",
    fontWeight: 600,
    color: muted,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginTop: "0.15rem",
  },
  statDivider: {
    width: 1,
    height: 32,
    background: border,
  },

  main: {
    position: "relative",
    zIndex: 1,
    maxWidth: 880,
    margin: "0 auto",
    padding: "2rem 1.5rem 4rem",
  },
  sectionLabel: {
    fontSize: "0.7rem",
    fontWeight: 700,
    color: muted,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "1rem",
    paddingLeft: "0.2rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: "1rem",
  },

  card: {
    background: card,
    border: `1px solid ${border}`,
    borderRadius: radius,
    padding: "1.5rem",
    transition: "all 0.25s ease",
    display: "flex",
    flexDirection: "column",
    gap: "0.6rem",
    position: "relative",
  },
  cardHover: {
    borderColor: primary,
    boxShadow: `0 4px 12px -2px oklch(0.5960 0.1450 163.2250 / 0.10)`,
    transform: "translateY(-2px)",
  },
  cardDisabled: { opacity: 0.55 },
  cardBadge: {
    display: "inline-flex",
    alignSelf: "flex-start",
    padding: "0.2rem 0.6rem",
    borderRadius: 100,
    fontSize: "0.65rem",
    fontWeight: 700,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  },
  cardBadgeAvailable: {
    background: accent,
    color: primary,
  },
  cardBadgeSoon: {
    background: secondary,
    color: muted,
  },
  cardTitle: {
    fontFamily: "'Fraunces', serif",
    fontSize: "1.2rem",
    fontWeight: 600,
    letterSpacing: "-0.01em",
    lineHeight: 1.25,
  },
  cardDesc: {
    fontSize: "0.85rem",
    color: muted,
    lineHeight: 1.6,
    flex: 1,
  },
  tags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.35rem",
    marginTop: "0.2rem",
  },
  tag: {
    padding: "0.15rem 0.55rem",
    background: secondary,
    borderRadius: 100,
    fontSize: "0.68rem",
    fontWeight: 500,
    color: muted,
    fontFamily: "'JetBrains Mono', monospace",
  },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    marginTop: "0.5rem",
    paddingTop: "0.7rem",
    borderTop: `1px solid ${border}`,
  },
  cardMeta: {
    fontSize: "0.72rem",
    color: muted,
    fontWeight: 500,
  },
  cardMetaDot: { fontSize: "0.72rem", color: border },
  cardArrow: {
    marginLeft: "auto",
    fontSize: "1rem",
    color: primary,
    transition: "transform 0.2s ease",
  },
  cardArrowHover: { transform: "translateX(3px)" },

  footer: {
    position: "relative",
    zIndex: 1,
    textAlign: "center",
    padding: "2rem",
    fontSize: "0.72rem",
    color: muted,
    fontWeight: 500,
    borderTop: `1px solid ${border}`,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.6rem",
  },
  footerLogo: {
    height: 24,
    objectFit: "contain",
    opacity: 0.5,
  },
};
