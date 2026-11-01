import * as THREE from 'three';

/**
 * Invisible hit targets.
 *
 * Physical controls on the machine are a few millimetres across; aimed at a
 * mouse from a 1.2 m camera they are frustrating. Each control gets a slightly
 * larger invisible proxy so the exhibition experience stays discoverable
 * without changing a single visible pixel (RITUAL-03 §11.5).
 */

const proxyMaterial = new THREE.MeshBasicMaterial({
  name: 'mInvisibleHitProxy',
  visible: false,
  depthWrite: false,
  // Open-topped proxies (the jar) must still be pickable from above.
  side: THREE.DoubleSide,
});

export function attachHitProxy(
  owner: THREE.Object3D,
  id: string,
  build: () => THREE.BufferGeometry,
  position: THREE.Vector3,
): THREE.Mesh {
  const key = `ritualHit:${id}`;
  const existing = owner.userData[key] as THREE.Mesh | undefined;
  if (existing) return existing;

  const proxy = new THREE.Mesh(build(), proxyMaterial);
  proxy.name = key;
  proxy.position.copy(position);
  proxy.visible = true;
  proxy.renderOrder = -1;
  owner.add(proxy);
  owner.userData[key] = proxy;
  return proxy;
}

export function sphereProxy(radius: number, segments = 12): THREE.BufferGeometry {
  const geometry = new THREE.SphereGeometry(radius, segments, Math.max(6, segments / 2));
  geometry.userData.ritualDisposable = true;
  return geometry;
}

export function cylinderProxy(radius: number, height: number, segments = 16): THREE.BufferGeometry {
  const geometry = new THREE.CylinderGeometry(radius, radius, height, segments, 1, false);
  geometry.userData.ritualDisposable = true;
  return geometry;
}

/**
 * A soft dark ellipse used as an always-correct contact shadow beneath props
 * that move (the cup and the bean container). Cheaper and more reliable than
 * re-rendering a shadow map for two small objects.
 */
export function createContactBlobTexture(): THREE.Texture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(0,0,0,0.55)');
    gradient.addColorStop(0.45, 'rgba(0,0,0,0.3)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
