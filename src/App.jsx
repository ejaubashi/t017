import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Plus,
  Minus,
  X,
  Menu,
  Grid2X2,
  GalleryHorizontal,
  Check,
  Copy,
  MoveUpRight,
  Asterisk,
} from "lucide-react";
import { projects } from "./projects";

const EMAIL = "jaubashi@gmail.com";
const services = [
  {
    title: "Design with intention",
    description:
      "Distinctive identities and thoughtful websites, shaped around your story. From the first conversation to the smallest detail, every choice has a reason.",
  },
  {
    title: "Build with care",
    description:
      "Responsive, accessible websites that feel as good as they look. Clean development brings the design to life across devices, with performance and usability built in.",
  },
  {
    title: "Make room for motion",
    description:
      "Small interactions and expressive animations that add personality. Movement guides attention, gives feedback, and makes a digital experience feel human.",
  },
];

function ProjectArt({ project, large = false }) {
  return (
    <div
      className={`project-art art-${project.style} ${large ? "art-large" : ""}`}
      aria-hidden="true"
    >
      {project.style === "architecture" && (
        <>
          <img src={`${import.meta.env.BASE_URL}images/architecture.webp`} alt="" loading="lazy" />
          <div className="art-topline">
            <span>STILL HOUSE</span>
            <span>Architecture & interiors</span>
          </div>
          <div className="architecture-title">
            Room to
            <br />
            <em>be.</em>
          </div>
          <span className="art-corner">Spaces for a slower life ↗</span>
        </>
      )}
      {project.style === "soma" && (
        <>
          <div className="soma-word">soma</div>
          <div className="soma-sun" />
          <div className="soma-can">
            <div className="can-top" />
            <span className="can-small">A LITTLE SUNSHINE</span>
            <strong>soma</strong>
            <span className="can-fruit" />
            <span className="can-flavor">
              BLOOD ORANGE
              <br />
              NATURALLY BRIGHT
            </span>
            <span className="can-bottom">FEEL-GOOD SPARKLING WATER</span>
          </div>
          <div className="soma-caption">
            Sip a little
            <br />
            <em>sunshine.</em>
          </div>
          <span className="art-corner">Good things come naturally.</span>
        </>
      )}
      {project.style === "form" && (
        <>
          <div className="form-top">
            <span>F / S</span>
            <span>EXPLORATIONS IN MOTION</span>
          </div>
          <div className="sculpture">
            <div />
            <div />
            <div />
            <div />
            <div />
          </div>
          <div className="form-title">
            form<span>in a constant state of change</span>
          </div>
        </>
      )}
      {project.style === "offhours" && (
        <>
          <div className="off-top">A JOURNAL FOR THE IN-BETWEEN</div>
          <div className="off-title">
            Off
            <br />
            <em>Hours.</em>
          </div>
          <div className="off-orb" />
          <span className="art-corner">Take your time. Make it yours.</span>
        </>
      )}
      {project.style === "common" && (
        <>
          <div className="common-mark">
            <div />
            <div />
            <div />
            <div />
          </div>
          <div className="common-title">
            common
            <br />
            ground<span>A space for good ideas.</span>
          </div>
          <span className="common-corner">COME AS YOU ARE ↗</span>
        </>
      )}
    </div>
  );
}

function ProjectDialog({ project, onClose, onNext }) {
  const dialogRef = useRef(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);
  useEffect(() => {
    dialogRef.current.scrollTop = 0;
  }, [project.id]);
  return (
    <dialog
      className="project-dialog"
      ref={dialogRef}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      aria-labelledby="project-title"
    >
      <div className="dialog-shell">
        <div className="dialog-toolbar">
          <span>SELECTED WORK / CONCEPT PROJECT</span>
          <button
            className="close-button"
            aria-label="Close project"
            onClick={onClose}
          >
            <X size={21} />
          </button>
        </div>
        <div className="dialog-heading">
          <h2 id="project-title">{project.name}</h2>
          <p>
            {project.discipline}
            <br />
            {project.year}
          </p>
        </div>
        <ProjectArt project={project} large />
        <div className="project-story">
          <div>
            <span className="eyebrow">THE IDEA</span>
            <h3>{project.tagline}</h3>
            <p>{project.description}</p>
          </div>
          <div className="project-deliverables">
            <span className="eyebrow">WHAT WENT INTO IT</span>
            {project.deliverables.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
        <div className="project-process">
          <div>
            <h4>The challenge</h4>
            <p>{project.challenge}</p>
          </div>
          <div>
            <h4>The approach</h4>
            <p>{project.approach}</p>
          </div>
        </div>
        <button className="next-project" onClick={onNext}>
          <span>
            Keep exploring<small>Next project</small>
          </span>
          <ArrowRight size={38} />
        </button>
      </div>
    </dialog>
  );
}

function Work({ onOpen }) {
  const [filter, setFilter] = useState("All");
  const [view, setView] = useState("carousel");
  const [current, setCurrent] = useState(0);
  const touchStart = useRef(null);
  const filtered = projects.filter(
    (project) => filter === "All" || project.category === filter,
  );
  const active = filtered[current];
  const changeProject = (direction) =>
    setCurrent(
      (index) => (index + direction + filtered.length) % filtered.length,
    );
  const selectFilter = (category) => {
    setFilter(category);
    setCurrent(0);
  };
  return (
    <section
      id="work"
      className="work-section section-dark"
      aria-labelledby="work-title"
    >
      <div className="work-heading section-padding reveal">
        <div>
          <span className="eyebrow">
            <span className="tiny-dot" /> SELECTED WORK
          </span>
          <h2 id="work-title">
            A little curiosity.
            <br />A lot of <em>possibility.</em>
          </h2>
        </div>
        <p>
          A selection of digital experiences,
          <br />
          brand worlds, and things in motion.
          <br />
          <span>Independent concepts, made with care.</span>
        </p>
      </div>
      <div className="work-controls section-padding">
        <div className="filters" aria-label="Filter projects">
          {["All", "Websites", "Motion"].map((category) => (
            <button
              key={category}
              onClick={() => selectFilter(category)}
              aria-pressed={filter === category}
            >
              {category}
              {category === "All" && (
                <sup>{projects.length.toString().padStart(2, "0")}</sup>
              )}
            </button>
          ))}
        </div>
        <div className="view-switch" aria-label="Project layout">
          <button
            aria-label="Carousel view"
            aria-pressed={view === "carousel"}
            onClick={() => setView("carousel")}
          >
            <GalleryHorizontal size={18} />
          </button>
          <button
            aria-label="Grid view"
            aria-pressed={view === "grid"}
            onClick={() => setView("grid")}
          >
            <Grid2X2 size={18} />
          </button>
        </div>
      </div>
      {view === "carousel" ? (
        <>
          <div
            className="project-carousel"
            tabIndex={0}
            role="region"
            aria-label="Project carousel. Use left and right arrow keys to browse."
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                event.preventDefault();
                changeProject(event.key === "ArrowRight" ? 1 : -1);
              }
            }}
            onTouchStart={(event) => {
              touchStart.current = event.touches[0].clientX;
            }}
            onTouchEnd={(event) => {
              if (touchStart.current === null) return;
              const distance =
                touchStart.current - event.changedTouches[0].clientX;
              if (Math.abs(distance) > 45) changeProject(distance > 0 ? 1 : -1);
              touchStart.current = null;
            }}
          >
            <div className="carousel-stage">
              {filtered.map((project, index) => {
                let offset = index - current;
                if (offset > filtered.length / 2) offset -= filtered.length;
                if (offset < -filtered.length / 2) offset += filtered.length;
                return (
                  <button
                    key={project.id}
                    className={`carousel-card ${offset === 0 ? "is-current" : ""}`}
                    style={{
                      "--offset": offset,
                      "--angle": `${offset * -13}deg`,
                      "--scale": offset === 0 ? 1 : 0.87,
                    }}
                    aria-label={`${offset === 0 ? "View" : "Select"} ${project.name}`}
                    tabIndex={offset === 0 ? 0 : -1}
                    onClick={() =>
                      offset === 0 ? onOpen(project) : setCurrent(index)
                    }
                  >
                    <ProjectArt project={project} />
                    <span className="card-open">
                      <ArrowUpRight size={22} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="carousel-bottom section-padding">
            <div className="project-caption" aria-live="polite">
              <span>
                {active.name}
                <ArrowUpRight size={17} />
              </span>
              <p>{active.discipline}</p>
            </div>
            <div className="carousel-navigation">
              <span>
                {String(current + 1).padStart(2, "0")}{" "}
                <span>/ {String(filtered.length).padStart(2, "0")}</span>
              </span>
              <button
                className="round-button"
                aria-label="Previous project"
                onClick={() => changeProject(-1)}
              >
                <ArrowLeft size={19} />
              </button>
              <button
                className="round-button"
                aria-label="Next project"
                onClick={() => changeProject(1)}
              >
                <ArrowRight size={19} />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="project-grid section-padding">
          {filtered.map((project) => (
            <button
              className="grid-card"
              key={project.id}
              onClick={() => onOpen(project)}
            >
              <div className="grid-art">
                <ProjectArt project={project} />
                <span className="card-open">
                  <ArrowUpRight size={22} />
                </span>
              </div>
              <div className="grid-caption">
                <span>{project.name}</span>
                <span>
                  {project.category} <ArrowUpRight size={16} />
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
      <div className="work-footnote section-padding">
        <span>Thoughtfully designed. Carefully developed.</span>
        <Asterisk size={21} strokeWidth={1.2} />
        <span>Always a work in progress.</span>
      </div>
    </section>
  );
}

function About() {
  const [openService, setOpenService] = useState(0);
  return (
    <section id="about" className="about-section" aria-labelledby="about-title">
      <div className="about-image">
        <img
          src={`${import.meta.env.BASE_URL}images/studio.webp`}
          alt="A warm creative studio with a designer seated in an orange lounge chair"
          loading="lazy"
        />
        <span className="image-caption">
          A little space to think differently.
        </span>
        <div className="about-image-label">
          Curious by nature.
          <br />
          <em>Creative by choice.</em>
        </div>
      </div>
      <div className="about-copy section-padding">
        <span className="eyebrow">
          <span className="tiny-dot" /> THE PERSON BEHIND THE PIXELS
        </span>
        <h2 id="about-title">
          Good design
          <br />
          starts with
          <br />
          <em>a conversation.</em>
        </h2>
        <div className="about-intro">
          <p>
            Hey, I’m Endy. An independent designer and creative developer
            turning ideas into digital experiences with character.
          </p>
          <p>
            I bring strategy, design, and development together to make things
            that feel considered, work beautifully, and leave a lasting
            impression.
          </p>
        </div>
        <div className="services">
          {services.map((service, index) => (
            <div
              className={`service ${openService === index ? "is-open" : ""}`}
              key={service.title}
            >
              <button
                aria-expanded={openService === index}
                aria-controls={`service-${index}`}
                onClick={() =>
                  setOpenService(openService === index ? null : index)
                }
              >
                {service.title}
                {openService === index ? (
                  <Minus size={20} />
                ) : (
                  <Plus size={20} />
                )}
              </button>
              <div
                id={`service-${index}`}
                className="service-description"
                hidden={openService !== index}
              >
                <p>{service.description}</p>
              </div>
            </div>
          ))}
        </div>
        <a className="text-link" href="#contact">
          Let’s make something feel right <ArrowUpRight size={19} />
        </a>
      </div>
    </section>
  );
}

function Contact() {
  const [kind, setKind] = useState("A website");
  const [brief, setBrief] = useState(null);
  const [copied, setCopied] = useState(false);
  const submit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const message = `Hi Endy,\n\n${data.get("message")}\n\nProject: ${kind}\nBudget: ${data.get("budget") || "Let’s discuss"}\n\nFrom ${data.get("name")}\n${data.get("email")}`;
    setBrief({
      name: data.get("name"),
      body: message,
      subject: `${kind} — inquiry from ${data.get("name")}`,
    });
    setCopied(false);
  };
  const copyBrief = async () => {
    try {
      await navigator.clipboard.writeText(brief.body);
      setCopied(true);
    } catch {
      const file = new Blob([brief.body], { type: "text/plain" });
      const url = URL.createObjectURL(file);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "project-inquiry.txt";
      anchor.click();
      URL.revokeObjectURL(url);
    }
  };
  return (
    <section
      id="contact"
      className="contact-section section-padding"
      aria-labelledby="contact-title"
    >
      <div className="contact-top">
        <span className="eyebrow">
          <span className="tiny-dot" /> SOMETHING IN MIND?
        </span>
        <span className="contact-availability">
          <span /> OPEN FOR COLLABORATIONS
        </span>
      </div>
      <h2 id="contact-title" className="reveal">
        Let’s make
        <br />
        <em>something matter.</em>
        <MoveUpRight className="contact-title-arrow" strokeWidth={0.8} />
      </h2>
      <div className="contact-content">
        <div className="contact-aside">
          <p>
            A new idea, a fresh perspective,
            <br />
            or just a friendly hello.
            <br />
            I’d love to hear from you.
          </p>
          <a href={`mailto:${EMAIL}`} className="email-link">
            {EMAIL}
            <ArrowUpRight size={20} />
          </a>
          <span className="contact-note">
            Good conversations are where it all begins.
          </span>
        </div>
        <form onSubmit={submit} className="contact-form">
          <fieldset>
            <legend>I’m thinking about…</legend>
            <div className="project-types">
              {["A website", "Design & motion", "Something else"].map(
                (item) => (
                  <button
                    type="button"
                    key={item}
                    aria-pressed={kind === item}
                    onClick={() => {
                      setKind(item);
                      setBrief(null);
                    }}
                  >
                    {item}
                    {kind === item && <Check size={13} />}
                  </button>
                ),
              )}
            </div>
          </fieldset>
          <div className="form-row">
            <label>
              Your name
              <input
                name="name"
                autoComplete="name"
                placeholder="What should I call you?"
                required
                maxLength={100}
                onChange={() => setBrief(null)}
              />
            </label>
            <label>
              Email address
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@somewhere.com"
                required
                maxLength={254}
                onChange={() => setBrief(null)}
              />
            </label>
          </div>
          <label>
            A little about your project
            <textarea
              name="message"
              placeholder="The idea, the ambition, the what-if…"
              required
              minLength={10}
              maxLength={4000}
              rows={3}
              onChange={() => setBrief(null)}
            />
          </label>
          <div className="budget-label">
            <label htmlFor="budget">Have a budget in mind?</label>
            <select
              id="budget"
              name="budget"
              defaultValue=""
              onChange={() => setBrief(null)}
            >
              <option value="">Let’s figure it out together</option>
              <option>Under €2,000</option>
              <option>€2,000 – €5,000</option>
              <option>€5,000 – €10,000</option>
              <option>€10,000+</option>
            </select>
          </div>
          {brief ? (
            <div className="form-success" role="status">
              <div>
                <Check size={18} />
                <span>
                  Your inquiry is ready.
                  <small>Open your email app to review and send it.</small>
                </span>
              </div>
              <a
                className="submit-button"
                href={`mailto:${EMAIL}?subject=${encodeURIComponent(brief.subject)}&body=${encodeURIComponent(brief.body)}`}
              >
                Open email draft
                <ArrowUpRight size={19} />
              </a>
              <button type="button" className="copy-brief" onClick={copyBrief}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied to clipboard" : "Copy inquiry instead"}
              </button>
            </div>
          ) : (
            <>
              <button className="submit-button" type="submit">
                Start a conversation
                <ArrowUpRight size={20} />
              </button>
              <p className="form-note">
                You’ll review your inquiry in your email app before sending.
              </p>
            </>
          )}
        </form>
      </div>
      <footer>
        <a href="#home" className="wordmark">
          endy j
          <span aria-hidden="true">
            <Asterisk size={12} />
          </span>
        </a>
        <span>Made with intention. © {new Date().getFullYear()} Endy J</span>
        <a href="#home" className="back-top">
          Back to top
          <ArrowUpRight size={16} />
        </a>
      </footer>
    </section>
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [project, setProject] = useState(null);
  const heroRef = useRef(null);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-20% 0px -55% 0px" },
    );
    document
      .querySelectorAll("main > section")
      .forEach((section) => observer.observe(section));
    const reveals = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            reveals.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    document
      .querySelectorAll(".reveal")
      .forEach((element) => reveals.observe(element));
    return () => {
      observer.disconnect();
      reveals.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const closeMenu = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeMenu);
    return () => window.removeEventListener("keydown", closeMenu);
  }, [menuOpen]);
  const moveHero = (event) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    heroRef.current?.style.setProperty(
      "--mouse-x",
      `${(event.clientX / window.innerWidth - 0.5) * 9}px`,
    );
    heroRef.current?.style.setProperty(
      "--mouse-y",
      `${(event.clientY / window.innerHeight - 0.5) * 6}px`,
    );
  };
  const lightHeader = ["about", "contact"].includes(activeSection);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header
        className={`site-header ${scrolled ? "is-scrolled" : ""} ${lightHeader ? "on-light" : ""} ${menuOpen ? "menu-open" : ""}`}
      >
        <a
          href="#home"
          className="wordmark"
          aria-label="Endy J home"
          onClick={() => setMenuOpen(false)}
        >
          endy j
          <span aria-hidden="true">
            <Asterisk size={12} />
          </span>
        </a>
        <div className="header-note">
          Independent mind.
          <br />
          Working everywhere.
        </div>
        <nav
          aria-label="Main navigation"
          id="main-nav"
          className={menuOpen ? "is-open" : ""}
        >
          {[
            ["work", "Work"],
            ["about", "About"],
            ["contact", "Let’s talk"],
          ].map(([id, label]) => (
            <a
              key={id}
              className={activeSection === id ? "active" : ""}
              href={`#${id}`}
              onClick={() => setMenuOpen(false)}
            >
              {label}
              {id === "contact" && <ArrowUpRight size={15} />}
            </a>
          ))}
        </nav>
        <button
          className="menu-toggle"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="main-nav"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>
      <main id="main">
        <section
          className="hero"
          id="home"
          ref={heroRef}
          onMouseMove={moveHero}
        >
          <div className="hero-visual">
            <img
              src={`${import.meta.env.BASE_URL}images/studio.webp`}
              alt="Warm sunlight falling through a creative studio"
              fetchPriority="high"
            />
          </div>
          <div className="hero-shade" />
          <div className="hero-grain" />
          <div className="hero-content section-padding">
            <div className="hero-eyebrow">
              <span className="tiny-dot" /> WEB DESIGN · DEVELOPMENT · MOTION
            </div>
            <h1>
              Make it
              <br />
              feel <em>something.</em>
              <span className="title-spark">
                <Asterisk strokeWidth={1} />
              </span>
            </h1>
            <div className="hero-description">
              <span className="hero-line" />
              <p>
                Thoughtful digital experiences.
                <br />A little unexpected. Entirely you.
              </p>
            </div>
          </div>
          <div className="hero-bottom section-padding">
            <a href="#work" className="explore-link">
              <span className="explore-circle">
                <ArrowDown size={17} />
              </span>
              Step into my world
            </a>
            <div className="hero-bottom-note">
              A good idea is just the beginning.
            </div>
            <a href="#contact" className="availability">
              <span className="status-dot" /> AVAILABLE FOR SELECT PROJECTS
              <ArrowUpRight size={15} />
            </a>
          </div>
          <div className="hero-edge-label">DESIGN WITH FEELING</div>
        </section>
        <Work onOpen={setProject} />
        <About />
        <Contact />
      </main>
      {project && (
        <ProjectDialog
          project={project}
          onClose={() => setProject(null)}
          onNext={() =>
            setProject(
              projects[
                (projects.findIndex((item) => item.id === project.id) + 1) %
                  projects.length
              ],
            )
          }
        />
      )}
    </>
  );
}
