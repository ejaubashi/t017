import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowDown,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  Check,
  CircleDot,
  Copy,
  GalleryHorizontal,
  Grid2X2,
  Mic,
  Square,
  X,
} from "lucide-react";
import PhotoEffects from "./PhotoEffects";
import { assets, projects, socials } from "./projects";

const GalleryCanvas = lazy(() => import("./GalleryCanvas"));
const EMAIL = "jaubashi@gmail.com";
const pages = ["home", "portfolio", "about", "contacts"];
const pageFromHash = () => {
  const route = location.hash.replace(/^#\/?/, "");
  return pages.includes(route) ? route : "home";
};

function CrossFrame({ className = "", children }) {
  return (
    <div className={`cross-frame ${className}`}>
      <i />
      <i />
      <i />
      <i />
      {children}
    </div>
  );
}

function ProjectDialog({ project, onClose, onNext }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current.showModal();
  }, []);
  useEffect(() => {
    ref.current.scrollTop = 0;
  }, [project]);
  return (
    <dialog
      ref={ref}
      className="project-detail"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      aria-labelledby="project-title"
    >
      <div className="detail-inner">
        <header className="detail-header">
          <span>{project.category}</span>
          <button type="button" aria-label="Close project" onClick={onClose}>
            <X size={24} />
          </button>
        </header>
        <h2 id="project-title">{project.name}</h2>
        <p>{project.description}</p>
        <img src={project.image} alt={project.name} />
        <button className="detail-next" onClick={onNext}>
          Next project <ArrowRight size={24} />
        </button>
      </div>
    </dialog>
  );
}

function Portfolio({ onOpen, reducedMotion }) {
  const [filter, setFilter] = useState("All");
  const [view, setView] = useState("carousel");
  const [position, setPosition] = useState(0);
  const [webgl, setWebgl] = useState(true);
  const stageRef = useRef(null);
  const collection = useMemo(
    () =>
      projects.filter(
        (project) => filter === "All" || project.category === filter,
      ),
    [filter],
  );
  const current =
    ((Math.round(position) % collection.length) + collection.length) %
    collection.length;
  const move = useCallback(
    (delta) => setPosition((value) => value + delta),
    [],
  );
  useEffect(() => {
    if (view !== "carousel") return;
    const stage = stageRef.current;
    const wheel = (event) => {
      if (event.ctrlKey) return;
      event.preventDefault();
      move(
        (Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY) * 0.0025,
      );
    };
    stage.addEventListener("wheel", wheel, { passive: false });
    return () => stage.removeEventListener("wheel", wheel);
  }, [view, move]);
  const chooseFilter = (value) => {
    setFilter(value);
    setPosition(0);
  };
  return (
    <section
      className={`portfolio-page page-enter layout-${view}`}
      ref={stageRef}
      aria-label="Portfolio"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();
          move(event.key === "ArrowRight" ? 1 : -1);
        }
      }}
    >
      <div className="gallery-controls">
        <div className="gallery-filters" aria-label="Filter projects">
          {["All", "Web", "Motion"].map((value) => (
            <button
              key={value}
              aria-pressed={filter === value}
              onClick={() => chooseFilter(value)}
            >
              {value}
            </button>
          ))}
        </div>
        <div className="gallery-views">
          <button
            onClick={() => setView("carousel")}
            aria-label="Carousel view"
            aria-pressed={view === "carousel"}
          >
            <GalleryHorizontal size={21} strokeWidth={1} />
          </button>
          <button
            onClick={() => setView("grid")}
            aria-label="Grid view"
            aria-pressed={view === "grid"}
          >
            <Grid2X2 size={21} strokeWidth={1} />
          </button>
        </div>
      </div>
      {view === "carousel" && webgl ? (
        <>
          <Suspense
            fallback={
              <div className="gallery-loading" aria-label="Loading portfolio" />
            }
          >
            <GalleryCanvas
              projects={collection}
              position={position}
              onMove={move}
              onSelect={onOpen}
              onReady={setWebgl}
              reducedMotion={reducedMotion}
            />
          </Suspense>
          <CrossFrame className="selection-frame" />
          <button
            className="gallery-caption"
            onClick={() => onOpen(collection[current])}
            aria-live="polite"
          >
            {collection[current].name}
            <span>{collection[current].description}</span>
          </button>
          <div className="gallery-keyboard">
            <button onClick={() => move(-1)} aria-label="Previous project">
              <ArrowLeft size={20} />
            </button>
            <button onClick={() => move(1)} aria-label="Next project">
              <ArrowRight size={20} />
            </button>
          </div>
          <div className="sr-only">
            <p>
              Scroll, drag, or use the previous and next buttons to explore the
              portfolio.
            </p>
          </div>
        </>
      ) : (
        <div className="portfolio-grid">
          {collection.map((project) => (
            <button
              className="project-tile"
              key={project.id}
              onClick={() => onOpen(project)}
            >
              <div className="tile-image">
                <img src={project.image} alt="" loading="lazy" />
              </div>
              <div className="tile-caption">
                <span>
                  {project.name}
                  <small>{project.description}</small>
                </span>
                <ArrowDownRight size={17} />
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function About({ onContact, fromScene, reducedMotion }) {
  const scrollRef = useRef(null);
  useEffect(() => {
    if (reducedMotion) return;
    const scroller = scrollRef.current;
    const displacement = document.getElementById("scroll-displacement");
    const blur = document.getElementById("scroll-blur");
    let frame = 0;
    let previousScroll = scroller.scrollTop;
    let previousTime = performance.now();
    let amount = 0;
    let target = 0;
    const update = () => {
      frame = 0;
      target *= 0.86;
      amount += (target - amount) * 0.23;
      displacement.setAttribute("scale", String(amount * 72));
      blur.setAttribute("stdDeviation", `${amount * 6.5} ${amount * 0.55}`);
      scroller.classList.toggle("is-flowing", amount > 0.015);
      if (target > 0.005 || amount > 0.005)
        frame = requestAnimationFrame(update);
    };
    const disturb = (strength) => {
      target = Math.max(target, strength);
      if (!frame) frame = requestAnimationFrame(update);
    };
    const scroll = () => {
      const now = performance.now();
      const speed =
        Math.abs(scroller.scrollTop - previousScroll) /
        Math.max(12, now - previousTime);
      previousTime = now;
      previousScroll = scroller.scrollTop;
      disturb(Math.min(1, speed / 3));
    };
    const entrance = setTimeout(() => disturb(0.9), fromScene ? 1550 : 40);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("text-resolving");
            observer.unobserve(entry.target);
          }
        }
      },
      { root: scroller, rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
    );
    scroller
      .querySelectorAll(
        ".about-body h2, .about-principle > p:not(.about-values-label)",
      )
      .forEach((element) => observer.observe(element));
    scroller.addEventListener("scroll", scroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(entrance);
      observer.disconnect();
      scroller.removeEventListener("scroll", scroll);
      displacement.setAttribute("scale", "0");
      blur.setAttribute("stdDeviation", "0");
    };
  }, [fromScene, reducedMotion]);
  return (
    <section
      className={`about-page ${fromScene ? "from-scene" : "page-enter"}`}
      aria-labelledby="about-title"
    >
      <div className="about-paper" />
      <div className="about-color">
        <img className="about-portrait" src={assets.portrait} alt="Portrait" />
      </div>
      <img
        className="about-dots"
        src={assets.portraitDots}
        alt=""
        aria-hidden="true"
      />
      <div className="about-scroll" ref={scrollRef}>
        <div className="about-opening">
          <h1 id="about-title">
            Making the
            <br />
            complex clear
          </h1>
          <p className="about-lead">
            I’m an interface and motion designer. Before I draw anything, I get
            to know the client’s business, their competitors and audience, so I
            can then tell people in plain words what they sell and why they need
            it. On those words I build a website, an app or an ad, where the
            visuals back up the text and make the main thing stand out.
          </p>
        </div>
        <div className="about-body">
          <section className="about-industries">
            <p>Worked with businesses across industries</p>
            <h2>
              {[
                "Medicine",
                "Beauty",
                "Furniture fittings",
                "Heating & plumbing",
                "Real estate",
                "Marketing",
                "Military",
                "Consulting",
                "Automotive",
                "Logistics",
                "Law",
                "Optics",
                "Construction",
                "Fashion",
                "Food & agro",
                "Building materials",
                "Aviation",
                "Video production",
                "Education",
              ].map((item, index, items) => (
                <span key={item}>
                  {item}
                  {index < items.length - 1 && <b> / </b>}
                </span>
              ))}
            </h2>
          </section>
          <section className="about-principle">
            <p className="about-values-label">What matters to me</p>
            <span>01</span>
            <h2>Tangible results</h2>
            <p>
              I want design to give the client a tangible result, be it more
              enquiries or a product people finally understand, and to be
              beautiful too. Clients come to me as to an expert, so I propose
              the solutions myself and can explain why it’s done this way.
            </p>
          </section>
          <section className="about-principle">
            <span>02</span>
            <h2>Proud to show</h2>
            <p>
              I always bet on quality over quantity. I have to like the work
              myself, so I’m not ashamed to show it in my portfolio.
            </p>
          </section>
          <section className="about-principle">
            <span>03</span>
            <h2>Trying new things</h2>
            <p>
              I like trying new tools when they make the work more interesting
              and the result better. I’m not afraid of risk, experience comes
              faster with it.
            </p>
          </section>
          <section className="about-cta">
            <h2>
              Something complex?
              <br />
              Let’s make it clear.
            </h2>
            <button onClick={onContact}>
              Get in touch <ArrowRight size={18} />
            </button>
          </section>
        </div>
      </div>
    </section>
  );
}

function Contact({ onPrivacy, reducedMotion }) {
  const [time, setTime] = useState("");
  const [recording, setRecording] = useState(null);
  const [requestingMedia, setRequestingMedia] = useState(false);
  const [recorded, setRecorded] = useState(null);
  const [mediaError, setMediaError] = useState("");
  const [brief, setBrief] = useState(null);
  const [copied, setCopied] = useState(false);
  const [socialNote, setSocialNote] = useState("");
  const recorderRef = useRef(null);
  const mediaRequestRef = useRef(false);
  const streamRef = useRef(null);
  const recordedRef = useRef(null);
  const cancelledRef = useRef(false);
  const previewRef = useRef(null);
  useEffect(() => {
    cancelledRef.current = false;
    const update = () =>
      setTime(
        new Date().toLocaleTimeString("en-US", {
          timeZone: "Europe/Rome",
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    update();
    const interval = setInterval(update, 1000);
    return () => {
      clearInterval(interval);
      cancelledRef.current = true;
      if (recorderRef.current?.state === "recording")
        recorderRef.current.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (recordedRef.current) URL.revokeObjectURL(recordedRef.current.url);
    };
  }, []);
  const stopRecording = () => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    setRecording(null);
  };
  const startRecording = async (type) => {
    if (mediaRequestRef.current || recording) return;
    setMediaError("");
    setBrief(null);
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setMediaError(
        "Recording is unavailable in this browser. You can write your message below.",
      );
      return;
    }
    mediaRequestRef.current = true;
    setRequestingMedia(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === "video",
      });
      if (cancelledRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      if (recordedRef.current) URL.revokeObjectURL(recordedRef.current.url);
      setRecorded(null);
      recordedRef.current = null;
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      const chunks = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      recorder.onerror = () => {
        stream.getTracks().forEach((track) => track.stop());
        if (!cancelledRef.current) {
          setRecording(null);
          setMediaError(
            "Recording stopped unexpectedly. You can record again or write your message.",
          );
        }
      };
      recorder.onstop = () => {
        if (cancelledRef.current) return;
        const blob = new Blob(chunks, { type: recorder.mimeType });
        const extension = recorder.mimeType.includes("mp4") ? "mp4" : "webm";
        const media = {
          blob,
          url: URL.createObjectURL(blob),
          type,
          filename: `project-${type}.${extension}`,
        };
        recordedRef.current = media;
        setRecorded(media);
        setRecording(null);
        stream.getTracks().forEach((track) => track.stop());
      };
      recorder.start();
      setRecording(type);
      if (type === "video")
        requestAnimationFrame(() => {
          if (previewRef.current) previewRef.current.srcObject = stream;
        });
    } catch (error) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (cancelledRef.current) return;
      setMediaError(
        error.name === "NotAllowedError"
          ? "Allow microphone or camera access in your browser to record, or write your message below."
          : "Recording could not start. Please try again or write your message below.",
      );
    } finally {
      mediaRequestRef.current = false;
      if (!cancelledRef.current) setRequestingMedia(false);
    }
  };
  const removeRecording = () => {
    if (recordedRef.current) URL.revokeObjectURL(recordedRef.current.url);
    recordedRef.current = null;
    setRecorded(null);
    setBrief(null);
  };
  const submit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const message = String(data.get("message") || "").trim();
    if (!message && !recorded) {
      setMediaError("Write a message or record your idea before continuing.");
      return;
    }
    setMediaError("");
    const text = `Hi Endy,\n\n${message || "I recorded a message about my project."}${recorded ? `\n\nRecording to attach: ${recorded.filename}` : ""}\n\n${data.get("name")}\nReply to: ${data.get("reply")}`;
    setBrief({
      subject: `Project inquiry from ${data.get("name")}`,
      body: text,
    });
    setCopied(false);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(brief.body);
      setCopied(true);
    } catch {
      setMediaError(
        "Copying is unavailable. Open the email draft to send your inquiry.",
      );
    }
  };
  return (
    <section className="contacts-page" aria-label="Contacts">
      <div className="contacts-content">
        <div className="contact-meta">
          <span>Available worldwide</span>
          <span>
            <i />
            {time}
          </span>
        </div>
        <CrossFrame className="contact-eyes">
          <img src={assets.eyes} alt="A stippled portrait detail" />
          {!reducedMotion && (
            <div className="contact-face-transition" aria-hidden="true">
              <PhotoEffects
                source={assets.portrait}
                paper
                intro
                duration={1300}
                shift={0}
                zoom={2}
              />
            </div>
          )}
        </CrossFrame>
        <div className="contact-socials">
          {socials.map((social) =>
            social.href ? (
              <a
                key={social.name}
                href={social.href}
                target={social.name === "Email" ? undefined : "_blank"}
                rel="noreferrer"
              >
                {social.name}
              </a>
            ) : (
              <button
                key={social.name}
                onClick={() =>
                  setSocialNote(`For ${social.name}, contact me at ${EMAIL}.`)
                }
              >
                {social.name}
              </button>
            ),
          )}
        </div>
        {socialNote && (
          <p className="social-note" role="status">
            {socialNote} <a href={`mailto:${EMAIL}`}>Email me</a>
            <button
              aria-label="Dismiss social contact message"
              onClick={() => setSocialNote("")}
            >
              <X size={14} />
            </button>
          </p>
        )}
        <form
          className="reference-form"
          onSubmit={submit}
          onChange={() => setBrief(null)}
        >
          <div className="contact-fields">
            <label>
              <span className="sr-only">Name</span>
              <input
                name="name"
                placeholder="Name"
                autoComplete="name"
                required
                maxLength={100}
              />
            </label>
            <label className="reply-field">
              <span>Reply to</span>
              <input
                name="reply"
                placeholder="name@mail.com or @telegram"
                required
                maxLength={254}
                aria-label="Reply to"
              />
            </label>
          </div>
          <CrossFrame className="message-frame">
            <label htmlFor="project-message" className="sr-only">
              Tell me about your project
            </label>
            <textarea
              id="project-message"
              name="message"
              rows={5}
              maxLength={5000}
              placeholder="Tell me about your project"
              disabled={Boolean(recording)}
            />
            <div className="record-controls">
              {recording ? (
                <button
                  type="button"
                  className="stop-recording"
                  onClick={stopRecording}
                >
                  <Square size={13} fill="currentColor" />
                  Stop {recording}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={requestingMedia}
                    onClick={() => startRecording("voice")}
                  >
                    <Mic size={16} strokeWidth={1} />
                    Voice
                  </button>
                  <button
                    type="button"
                    disabled={requestingMedia}
                    onClick={() => startRecording("video")}
                  >
                    <CircleDot size={17} strokeWidth={1} />
                    Video
                  </button>
                </>
              )}
            </div>
            {recording === "video" && (
              <video
                className="live-preview"
                ref={previewRef}
                autoPlay
                muted
                playsInline
              />
            )}
            {recording === "voice" && (
              <div className="voice-recording" role="status">
                <i />
                Recording your voice…
              </div>
            )}
            {recorded && (
              <div className="recorded-preview">
                {recorded.type === "video" ? (
                  <video controls src={recorded.url} playsInline />
                ) : (
                  <audio controls src={recorded.url} />
                )}
                <button
                  type="button"
                  aria-label="Remove recording"
                  onClick={removeRecording}
                >
                  <X size={17} />
                </button>
              </div>
            )}
          </CrossFrame>
          <p className="message-hint">
            Write it, or tap Voice or Video to say it
          </p>
          {mediaError && (
            <p className="form-error" role="alert">
              {mediaError}
            </p>
          )}
          {brief ? (
            <div className="inquiry-ready" role="status">
              <p>
                Your inquiry is ready to review in your email app.
                {recorded && (
                  <>
                    {" "}
                    <a href={recorded.url} download={recorded.filename}>
                      Download your recording
                    </a>{" "}
                    and attach it to the email.
                  </>
                )}
              </p>
              <a
                className="contact-submit"
                href={`mailto:${EMAIL}?subject=${encodeURIComponent(brief.subject)}&body=${encodeURIComponent(brief.body)}`}
              >
                Open email draft
              </a>
              <button type="button" className="copy-inquiry" onClick={copy}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy inquiry"}
              </button>
            </div>
          ) : (
            <button className="contact-submit" disabled={Boolean(recording)}>
              Get in touch
            </button>
          )}
          <p className="contact-privacy">
            By sending, you agree to the{" "}
            <button type="button" onClick={onPrivacy}>
              privacy policy
            </button>
            .
          </p>
        </form>
        <footer className="contacts-footer">
          <span>© {new Date().getFullYear()} Endy J</span>
          <button onClick={onPrivacy}>Privacy & cookies</button>
        </footer>
      </div>
    </section>
  );
}

function Privacy({ onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      className="privacy-dialog"
      onCancel={onClose}
      aria-labelledby="privacy-title"
    >
      <button
        className="privacy-close"
        onClick={onClose}
        aria-label="Close privacy policy"
      >
        <X size={22} />
      </button>
      <h2 id="privacy-title">Privacy & cookies</h2>
      <p>
        Your contact details and project message are included in the email draft
        you choose to send to {EMAIL}.
      </p>
      <p>
        Voice and video recordings stay in your browser. You can download a
        recording and attach it to your email. Closing this page removes the
        recording from the browser’s memory.
      </p>
      <p>This portfolio uses no analytics or advertising cookies.</p>
    </dialog>
  );
}

export default function App() {
  const [page, setPage] = useState(pageFromHash);
  const [intro, setIntro] = useState(pageFromHash() === "home");
  const [introReady, setIntroReady] = useState(false);
  const [cameraTransition, setCameraTransition] = useState(false);
  const [cameraPlaying, setCameraPlaying] = useState(false);
  const [aboutEntrance, setAboutEntrance] = useState(false);
  const cameraRef = useRef(null);
  const introAnimationRef = useRef(null);
  const previousPage = useRef(page);
  const [project, setProject] = useState(null);
  const [privacy, setPrivacy] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(
    matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const route = () => {
      const destination = pageFromHash();
      const fromScene =
        destination === "about" &&
        ["home", "portfolio"].includes(previousPage.current) &&
        !reducedMotion;
      setCameraTransition(fromScene);
      setAboutEntrance(fromScene);
      previousPage.current = destination;
      setPage(destination);
      setProject(null);
      setPrivacy(false);
      setIntro(false);
    };
    addEventListener("hashchange", route);
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => {
      setReducedMotion(media.matches);
      if (media.matches) {
        setCameraTransition(false);
        setAboutEntrance(false);
      }
    };
    media.addEventListener("change", updateMotion);
    return () => {
      removeEventListener("hashchange", route);
      media.removeEventListener("change", updateMotion);
    };
  }, [reducedMotion]);
  const readyForIntro = useCallback(() => setIntroReady(true), []);
  useEffect(() => {
    if (!intro || (!introReady && !reducedMotion)) return;
    introAnimationRef.current?.beginElement();
    const timer = setTimeout(
      () => {
        setIntro(false);
      },
      reducedMotion ? 0 : 3000,
    );
    return () => clearTimeout(timer);
  }, [intro, introReady, reducedMotion]);
  useEffect(() => {
    const video = cameraRef.current;
    setCameraPlaying(false);
    if (!cameraTransition) {
      video.pause();
      return;
    }
    video.currentTime = 0;
    video.play().catch(() => setCameraTransition(false));
    const timeout = setTimeout(() => setCameraTransition(false), 4000);
    return () => {
      clearTimeout(timeout);
      video.pause();
    };
  }, [cameraTransition]);
  const navigate = useCallback((destination) => {
    location.hash = destination === "home" ? "/" : `/${destination}`;
  }, []);
  useEffect(() => {
    if (page !== "home") return;
    let total = 0;
    const wheel = (event) => {
      if (event.ctrlKey || event.deltaY <= 0) return;
      total += event.deltaY;
      if (total > 60) navigate("portfolio");
    };
    addEventListener("wheel", wheel, { passive: true });
    return () => removeEventListener("wheel", wheel);
  }, [page, navigate]);
  const paper = page === "about" || page === "contacts";
  return (
    <div
      className={`portfolio-app page-${page} ${intro ? "is-intro" : ""} ${intro && introReady ? "intro-playing" : ""} ${cameraTransition && !cameraPlaying ? "camera-waiting" : ""} ${paper ? "is-paper" : ""}`}
    >
      <svg
        width="0"
        height="0"
        className="filter-definitions"
        aria-hidden="true"
      >
        <defs>
          <filter
            id="intro-liquid"
            x="-30%"
            y="-80%"
            width="160%"
            height="260%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.035"
              numOctaves="2"
              seed="8"
              result="liquid-noise"
            />
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="3.8"
              result="soft-type"
            />
            <feColorMatrix
              in="soft-type"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="thick-type"
            />
            <feDisplacementMap
              in="thick-type"
              in2="liquid-noise"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
            >
              {intro && introReady && !reducedMotion && (
                <animate
                  ref={introAnimationRef}
                  attributeName="scale"
                  values="0;0;90;45;0"
                  keyTimes="0;.30;.49;.73;1"
                  dur="3s"
                  begin="indefinite"
                  fill="freeze"
                />
              )}
            </feDisplacementMap>
          </filter>
          <filter
            id="scroll-liquid"
            x="-20%"
            y="-60%"
            width="140%"
            height="220%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.007 0.05"
              numOctaves="2"
              seed="5"
              result="scroll-noise"
            />
            <feDisplacementMap
              id="scroll-displacement"
              in="SourceGraphic"
              in2="scroll-noise"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
            />
            <feGaussianBlur
              id="scroll-blur"
              stdDeviation="0"
              result="scroll-soft"
            />
            <feColorMatrix
              in="scroll-soft"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
            />
          </filter>
          <filter id="stipple-alpha" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -0.91 -3.06 -0.31 0 3.5"
            />
          </filter>
        </defs>
      </svg>
      <a
        className="skip-link"
        href="#main-view"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main-view").focus();
        }}
      >
        Skip to content
      </a>
      <div
        className={`scene-background ${page === "portfolio" ? "is-blurred" : ""}`}
      >
        <img src={assets.scene} alt="" fetchPriority="high" />
        {intro && (
          <PhotoEffects source={assets.scene} intro onReady={readyForIntro} />
        )}
      </div>
      <header className="site-header">
        <a href="#/" className="site-name" aria-label="Endy J home">
          Endy J
        </a>
        <nav aria-label="Main navigation">
          {[
            ["portfolio", "Portfolio,"],
            ["about", "About,"],
            ["contacts", "Contacts"],
          ].map(([route, label]) => (
            <a
              key={route}
              href={`#/${route}`}
              aria-current={page === route ? "page" : undefined}
            >
              {label}
            </a>
          ))}
        </nav>
      </header>
      <main id="main-view" tabIndex={-1}>
        {page === "home" && (
          <section className="home-page page-enter" aria-label="Home">
            <div className="opening-name" aria-hidden="true">
              Endy J
            </div>
            <h1 className="home-title">
              <span>Web</span>
              <span className="ampersand">&</span>
              <span>motion</span>
              <span>Designer</span>
            </h1>
            <a className="scroll-prompt" href="#/portfolio">
              Scroll to watch portfolio
              <ArrowDown size={18} strokeWidth={1} />
            </a>
          </section>
        )}
        {page === "portfolio" && (
          <Portfolio onOpen={setProject} reducedMotion={reducedMotion} />
        )}
        {page === "about" && (
          <About
            onContact={() => navigate("contacts")}
            fromScene={aboutEntrance}
            reducedMotion={reducedMotion}
          />
        )}
        {page === "contacts" && (
          <Contact
            onPrivacy={() => setPrivacy(true)}
            reducedMotion={reducedMotion}
          />
        )}
      </main>
      <video
        ref={cameraRef}
        className={`camera-transition ${cameraTransition ? "is-active" : ""}`}
        src={`${import.meta.env.BASE_URL}reference/about-camera.mp4`}
        poster={assets.scene}
        preload="auto"
        muted
        playsInline
        aria-hidden="true"
        onPlaying={() => setCameraPlaying(true)}
        onEnded={() => setCameraTransition(false)}
        onError={() => setCameraTransition(false)}
      />
      <PhotoEffects
        source={paper ? assets.portrait : assets.scene}
        disabled={
          intro ||
          Boolean(project || privacy) ||
          !["home", "about"].includes(page)
        }
        paper={paper}
      />
      <aside className="award-ribbon" aria-label="Reference design nominee">
        <strong>W.</strong>
        <span>Nominee</span>
      </aside>
      <div className="screen-grain" aria-hidden="true" />
      <div className="screen-vignette" aria-hidden="true" />
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
      {privacy && <Privacy onClose={() => setPrivacy(false)} />}
    </div>
  );
}
