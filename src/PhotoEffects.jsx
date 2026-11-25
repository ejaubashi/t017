import { useEffect, useRef } from "react";

const vertexSource = `
  attribute vec2 aPosition;
  varying vec2 vUv;
  void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const fragmentSource = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uPhoto;
  uniform sampler2D uTrail;
  uniform vec2 uResolution;
  uniform vec2 uImageSize;
  uniform float uHorizontalAnchor;
  uniform float uPixelRatio;
  uniform float uTime;
  uniform float uPaper;
  uniform float uIntro;
  uniform float uShift;
  uniform float uZoom;

  float random(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 cell = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(random(cell), random(cell + vec2(1.0, 0.0)), f.x),
               mix(random(cell + vec2(0.0, 1.0)), random(cell + vec2(1.0)), f.x), f.y);
  }
  float field(vec2 p) {
    return noise(p) * 0.57 + noise(p * 2.07 + 7.0) * 0.28 + noise(p * 4.13) * 0.15;
  }
  vec3 photograph(vec2 uv) {
    float screenAspect = uResolution.x / uResolution.y;
    float imageAspect = uImageSize.x / uImageSize.y;
    vec2 cover = vec2(min(screenAspect / imageAspect, 1.0), min(imageAspect / screenAspect, 1.0));
    if (uPaper > 0.5) {
      uv = (uv - vec2(0.5, 0.62)) / uZoom + vec2(0.5, 0.62);
      uv.x += uShift;
    } else {
      uv = (uv - vec2(0.5, 0.2)) / uZoom + vec2(0.5, 0.2);
    }
    return texture2D(uPhoto, uv * cover + (1.0 - cover) * vec2(uHorizontalAnchor, 0.5)).rgb;
  }
  void main() {
    if (uIntro < 0.0 && texture2D(uTrail, vUv).r < 0.025) discard;
    vec2 pixel = gl_FragCoord.xy / uPixelRatio;
    vec3 photo = photograph(vUv);
    float luminance = dot(photo, vec3(0.2126, 0.7152, 0.0722));
    float grain = random(floor(pixel / 1.1));
    vec3 charcoal = vec3(0.145, 0.145, 0.15);
    vec3 paper = vec3(0.831, 0.804, 0.706);

    if (uIntro >= 0.0) {
      if (uPaper > 0.5) {
        float dots = step(grain, pow(1.0 - luminance, 1.35) * 1.25);
        gl_FragColor = vec4(mix(paper, vec3(0.56, 0.55, 0.48), dots), 1.0 - smoothstep(0.65, 1.0, uIntro));
        return;
      }
      float focus = exp(-dot((vUv - vec2(0.52, 0.48)) * vec2(6.0, 2.4),
                            (vUv - vec2(0.52, 0.48)) * vec2(6.0, 2.4)));
      vec2 cell = floor(pixel / 2.7);
      vec2 center = vec2(random(cell), random(cell + 17.0)) * 0.6 + 0.2;
      float point = 1.0 - smoothstep(0.14, 0.45, length(fract(pixel / 2.7) - center));
      float coarseDots = step(random(cell + 43.0), pow(luminance, 1.6) * 0.8) * point;
      float fineDots = step(grain, pow(luminance, 0.6));
      vec3 particles = mix(charcoal, vec3(0.74), mix(coarseDots, fineDots, focus));
      float spatial = field(vUv * vec2(4.3, 3.3)) * 0.76 + vUv.x * 0.10;
      float progress = smoothstep(0.28, 0.91, uIntro);
      float reveal = smoothstep(spatial - 0.14, spatial + 0.14, progress);
      float alpha = 1.0 - smoothstep(0.95, 1.0, uIntro);
      gl_FragColor = vec4(mix(particles, photo, reveal), alpha);
      return;
    }

    vec2 warp = vec2(field(vUv * 31.0 + uTime * 0.13), field(vUv * 29.0 + 13.0)) - 0.5;
    float paint = texture2D(uTrail, vUv + warp * 0.012).r;
    if (paint < 0.025) discard;
    float density = mix(pow(luminance, 1.2) * 0.55, pow(1.0 - luminance, 1.35) * 1.25, uPaper);
    float dots = step(grain, density);
    float dissolve = 1.0 - smoothstep(0.46, 0.88, paint);
    vec3 base = mix(charcoal, paper, uPaper);
    vec3 ink = mix(vec3(0.67, 0.67, 0.64), vec3(0.56, 0.55, 0.48), uPaper);
    vec3 color = mix(base, ink, dots * dissolve);
    float alpha = smoothstep(0.025, 0.13, paint) * step(grain * 0.11, paint);
    gl_FragColor = vec4(color, alpha);
  }
`;

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function PhotoEffects({
  source,
  paper = false,
  intro = false,
  disabled = false,
  onReady,
  duration = 3000,
  shift = paper ? 0.094 : 0,
  zoom = paper ? 1 : 1.15,
}) {
  const canvasRef = useRef(null);
  const readyRef = useRef(onReady);
  useEffect(() => {
    readyRef.current = onReady;
  }, [onReady]);
  useEffect(() => {
    const canvas = canvasRef.current;
    const reducedMotion = matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const coarsePointer = matchMedia("(pointer: coarse)").matches;
    if (disabled || reducedMotion || (!intro && coarsePointer)) {
      readyRef.current?.();
      return;
    }
    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
    });
    if (!gl) {
      readyRef.current?.();
      return;
    }
    const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertex || !fragment) {
      if (vertex) gl.deleteShader(vertex);
      if (fragment) gl.deleteShader(fragment);
      readyRef.current?.();
      return;
    }
    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      readyRef.current?.();
      return;
    }
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const attribute = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(attribute);
    gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
    const uniforms = {};
    for (const name of [
      "uPhoto",
      "uTrail",
      "uResolution",
      "uImageSize",
      "uHorizontalAnchor",
      "uPixelRatio",
      "uTime",
      "uPaper",
      "uIntro",
      "uShift",
      "uZoom",
    ]) {
      uniforms[name] = gl.getUniformLocation(program, name);
    }
    const textures = [gl.createTexture(), gl.createTexture()];
    textures.forEach((texture, index) => {
      gl.activeTexture(gl.TEXTURE0 + index);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        1,
        1,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 0, 255]),
      );
    });
    gl.uniform1i(uniforms.uPhoto, 0);
    gl.uniform1i(uniforms.uTrail, 1);
    gl.uniform1f(uniforms.uPaper, paper ? 1 : 0);
    gl.uniform1f(uniforms.uShift, shift);
    gl.uniform1f(uniforms.uZoom, zoom);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    const mask = document.createElement("canvas");
    const maskContext = mask.getContext("2d");
    const image = new Image();
    let disposed = false;
    let loaded = false;
    let frame = 0;
    let startTime = 0;
    let previousFrame = 0;
    let lastPaint = 0;
    let pointer = null;
    let queued = [];
    let pixelRatio;
    let width;
    let height;
    const resize = () => {
      width = canvas.clientWidth || innerWidth;
      height = canvas.clientHeight || innerHeight;
      pixelRatio = Math.min(devicePixelRatio, 1.5);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uniforms.uResolution, canvas.width, canvas.height);
      gl.uniform1f(uniforms.uPixelRatio, pixelRatio);
      gl.uniform1f(
        uniforms.uHorizontalAnchor,
        paper ? 0.5 : width <= 480 ? 0.55 : width <= 760 ? 0.54 : 0.5,
      );
      mask.width = Math.round(width * 0.5);
      mask.height = Math.round(height * 0.5);
      maskContext.setTransform(
        mask.width / width,
        0,
        0,
        mask.height / height,
        0,
        0,
      );
      maskContext.fillStyle = "#000";
      maskContext.fillRect(0, 0, width, height);
      pointer = null;
      queued = [];
      requestFrame();
    };
    const draw = (now) => {
      frame = 0;
      if (disposed) return;
      const elapsed = previousFrame ? Math.min(now - previousFrame, 40) : 16.67;
      previousFrame = now;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (!loaded) {
        if (intro && !paper) {
          gl.clearColor(0.145, 0.145, 0.15, 1);
          gl.clear(gl.COLOR_BUFFER_BIT);
        }
        return;
      }
      maskContext.fillStyle = `rgba(0,0,0,${1 - Math.pow(0.976, elapsed / 16.67)})`;
      maskContext.fillRect(0, 0, width, height);
      maskContext.strokeStyle = "#fff";
      maskContext.fillStyle = "#fff";
      maskContext.lineCap = "round";
      maskContext.lineJoin = "round";
      for (const point of queued) {
        maskContext.lineWidth = point.radius * 2;
        maskContext.beginPath();
        maskContext.moveTo(point.previousX, point.previousY);
        maskContext.lineTo(point.x, point.y);
        maskContext.stroke();
      }
      queued = [];
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, textures[1]);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mask);
      gl.uniform1f(uniforms.uTime, now / 1000);
      const progress = Math.min(1, (now - startTime) / duration);
      gl.uniform1f(uniforms.uIntro, intro ? progress : -1);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      if ((intro && progress < 1) || (!intro && now - lastPaint < 2400))
        requestFrame();
      else {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        previousFrame = 0;
      }
    };
    const requestFrame = () => {
      if (!frame && !disposed) frame = requestAnimationFrame(draw);
    };
    const move = (event) => {
      if (intro) return;
      if (
        event.target.closest(
          "button, a, input, textarea, dialog, .gallery-controls",
        )
      ) {
        pointer = null;
        return;
      }
      const now = performance.now();
      const bounds = canvas.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;
      const previous =
        pointer && now - pointer.time < 120
          ? pointer
          : { x: x - 0.1, y, time: now - 16 };
      const distance = Math.hypot(x - previous.x, y - previous.y);
      const speed = distance / Math.max(now - previous.time, 8);
      queued.push({
        x,
        y,
        previousX: previous.x,
        previousY: previous.y,
        radius: Math.min(64, 25 + speed * 16),
      });
      pointer = { x, y, time: now };
      lastPaint = now;
      requestFrame();
    };
    image.onload = () => {
      if (disposed) return;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textures[0]);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image,
      );
      gl.uniform2f(uniforms.uImageSize, image.width, image.height);
      loaded = true;
      startTime = performance.now();
      readyRef.current?.();
      requestFrame();
    };
    image.onerror = () => {
      canvas.style.visibility = "hidden";
      readyRef.current?.();
    };
    const contextLost = () => {
      canvas.style.visibility = "hidden";
      cancelAnimationFrame(frame);
      readyRef.current?.();
    };
    canvas.style.visibility = "visible";
    resize();
    image.src = source;
    addEventListener("resize", resize);
    addEventListener("pointermove", move, { passive: true });
    canvas.addEventListener("webglcontextlost", contextLost);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      removeEventListener("resize", resize);
      removeEventListener("pointermove", move);
      canvas.removeEventListener("webglcontextlost", contextLost);
      textures.forEach((texture) => gl.deleteTexture(texture));
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    };
  }, [source, paper, intro, disabled, duration, shift, zoom]);
  return (
    <canvas
      ref={canvasRef}
      className={intro ? "intro-effects" : "photo-effects"}
      aria-hidden="true"
    />
  );
}
