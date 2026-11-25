import { useEffect, useRef } from "react";
import * as THREE from "three";

const vertexShader = `
  varying vec2 vUv;
  varying float vEdge;
  uniform float uBend;
  uniform float uSpeed;
  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    float edge = pow(max(0.0, abs(world.x) - 7.2) / 2.0, 2.0);
    vEdge = abs(world.x) / 8.0;
    world.y *= 1.0 + edge * (uBend + uSpeed * 0.18);
    world.z += edge * 0.55;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;
const fragmentShader = `
  varying vec2 vUv;
  varying float vEdge;
  uniform float uSpeed;
  uniform sampler2D uTexture;
  uniform vec2 uImageSize;
  uniform vec2 uPlaneSize;
  void main() {
    float imageAspect = uImageSize.x / uImageSize.y;
    float planeAspect = uPlaneSize.x / uPlaneSize.y;
    vec2 ratio = vec2(min(planeAspect / imageAspect, 1.0), min(imageAspect / planeAspect, 1.0));
    vec2 uv = vUv * ratio + (1.0 - ratio) * 0.5;
    float fringe = pow(min(vEdge, 1.5), 3.0) * 0.004 * (1.0 + uSpeed);
    vec4 center = texture2D(uTexture, uv);
    gl_FragColor = vec4(texture2D(uTexture, uv + vec2(fringe, 0.0)).r, center.g, texture2D(uTexture, uv - vec2(fringe, 0.0)).b, center.a);
    #include <colorspace_fragment>
  }
`;

export default function GalleryCanvas({
  projects,
  position,
  onSelect,
  onMove,
  onReady,
  reducedMotion,
}) {
  const mountRef = useRef(null);
  const positionRef = useRef(position);
  const callbacks = useRef({ onSelect, onMove, onReady });
  useEffect(() => {
    positionRef.current = position;
  }, [position]);
  useEffect(() => {
    callbacks.current = { onSelect, onMove, onReady };
  });
  useEffect(() => {
    const mount = mountRef.current;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      callbacks.current.onReady(false);
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    const loader = new THREE.TextureLoader();
    const geometry = new THREE.PlaneGeometry(5.2, 3.2, 48, 18);
    const spacing = 5.58;
    const copyCount = projects.length < 4 ? 3 : 1;
    const items = Array.from(
      { length: projects.length * copyCount },
      (_, index) => projects[index % projects.length],
    );
    const meshes = items.map((project) => {
      const uniforms = {
        uTexture: { value: null },
        uImageSize: { value: new THREE.Vector2(1600, 1000) },
        uPlaneSize: { value: new THREE.Vector2(5.2, 3.2) },
        uBend: { value: 0.65 },
        uSpeed: { value: 0 },
      };
      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
        transparent: true,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.visible = false;
      loader.load(
        project.image,
        (texture) => {
          if (disposed) {
            texture.dispose();
            return;
          }
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.minFilter = THREE.LinearFilter;
          uniforms.uTexture.value = texture;
          uniforms.uImageSize.value.set(
            texture.image.width,
            texture.image.height,
          );
          mesh.visible = true;
        },
        undefined,
        () => {
          if (!disposed) callbacks.current.onReady(false);
        },
      );
      scene.add(mesh);
      return mesh;
    });
    let disposed = false;
    let frame;
    let current = positionRef.current;
    let width;
    let height;
    let baseDistance;
    let dragStart = null;
    let lastX;
    let moved = false;
    let dragVelocity = 0;
    let lastMoveTime = 0;
    let lastFrameTime = 0;
    const resize = () => {
      width = mount.clientWidth;
      height = mount.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      const cardWidthRatio = width < 700 ? 0.82 : 0.31;
      baseDistance =
        (5.2 * height) /
        (2 *
          Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) *
          width *
          cardWidthRatio);
      camera.position.z = baseDistance;
      camera.updateProjectionMatrix();
    };
    const projectAt = (clientX, clientY) => {
      const rect = mount.getBoundingClientRect();
      const visibleWidth =
        2 *
        Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) *
        camera.position.z *
        camera.aspect;
      const x = ((clientX - rect.left) / rect.width - 0.5) * visibleWidth;
      const unbentX = x;
      const nearest = Math.round(current + unbentX / spacing);
      const y =
        ((0.5 - (clientY - rect.top) / rect.height) * visibleWidth) /
        camera.aspect;
      const edge = Math.pow(Math.max(0, Math.abs(unbentX) - 7.2) / 2, 2);
      const insideWidth =
        Math.abs(unbentX - (nearest - current) * spacing) < 2.6;
      const insideHeight = Math.abs(y) < 1.6 * (1 + edge * 0.65);
      if (!insideWidth || !insideHeight) return null;
      const index =
        ((nearest % projects.length) + projects.length) % projects.length;
      return projects[index];
    };
    const pointerDown = (event) => {
      dragStart = event.clientX;
      lastX = event.clientX;
      moved = false;
      dragVelocity = 0;
      lastMoveTime = performance.now();
      mount.setPointerCapture(event.pointerId);
      mount.classList.add("is-dragging");
    };
    const pointerMove = (event) => {
      if (dragStart === null) return;
      if (Math.abs(event.clientX - dragStart) > 6) moved = true;
      const now = performance.now();
      dragVelocity =
        dragVelocity * 0.45 +
        ((lastX - event.clientX) / Math.max(8, now - lastMoveTime)) * 0.55;
      lastMoveTime = now;
      callbacks.current.onMove(
        (lastX - event.clientX) / Math.max(width * 0.32, 180),
      );
      lastX = event.clientX;
    };
    const pointerUp = (event) => {
      if (dragStart === null) return;
      mount.classList.remove("is-dragging");
      if (!moved) {
        const selected = projectAt(event.clientX, event.clientY);
        if (selected) callbacks.current.onSelect(selected);
      } else if (!reducedMotion && performance.now() - lastMoveTime < 100) {
        callbacks.current.onMove(
          THREE.MathUtils.clamp(
            (dragVelocity * 220) / Math.max(width * 0.32, 180),
            -2.2,
            2.2,
          ),
        );
      }
      dragStart = null;
    };
    const cancel = () => {
      dragStart = null;
      mount.classList.remove("is-dragging");
    };
    const render = (now) => {
      const elapsed = lastFrameTime ? Math.min(40, now - lastFrameTime) : 16.67;
      lastFrameTime = now;
      const speed = Math.abs(positionRef.current - current);
      const distance = baseDistance * (1 + Math.min(speed, 0.8) * 0.5);
      camera.position.z +=
        ((reducedMotion ? baseDistance : distance) - camera.position.z) *
        (reducedMotion ? 1 : 1 - Math.pow(0.94, elapsed / 16.67));
      current +=
        (positionRef.current - current) *
        (reducedMotion ? 1 : 1 - Math.pow(0.925, elapsed / 16.67));
      const circumference = spacing * meshes.length;
      meshes.forEach((mesh, index) => {
        let x = index * spacing - current * spacing;
        x =
          ((((x + circumference / 2) % circumference) + circumference) %
            circumference) -
          circumference / 2;
        mesh.position.x = x;
        mesh.material.uniforms.uSpeed.value = reducedMotion
          ? 0
          : Math.min(1.4, speed);
      });
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    mount.addEventListener("pointerdown", pointerDown);
    mount.addEventListener("pointermove", pointerMove);
    mount.addEventListener("pointerup", pointerUp);
    mount.addEventListener("pointercancel", cancel);
    frame = requestAnimationFrame(render);
    callbacks.current.onReady(true);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      mount.removeEventListener("pointerdown", pointerDown);
      mount.removeEventListener("pointermove", pointerMove);
      mount.removeEventListener("pointerup", pointerUp);
      mount.removeEventListener("pointercancel", cancel);
      meshes.forEach((mesh) => {
        mesh.material.uniforms.uTexture.value?.dispose();
        mesh.material.dispose();
      });
      geometry.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [projects, reducedMotion]);
  return <div className="gallery-canvas" ref={mountRef} aria-hidden="true" />;
}
