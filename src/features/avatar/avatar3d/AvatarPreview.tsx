import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { type ReactNode, useEffect, useMemo, useRef } from 'react';
import { StyleSheet } from 'react-native';
import * as THREE from 'three';

import { avatarArt } from '@/theme/avatarArt';

import type { AvatarLook } from '../logic/avatarLook';
import type { Framing } from '../logic/editor';
import { avatarScale } from '../logic/face';
import { previewShot } from '../logic/preview';
import { Avatar3D, AvatarLights, type AvatarAnimation } from './Avatar3D';

/** Rotation voulue de la figurine (radians) : écrite par le geste, suivie à chaque image. */
export type Turn = { readonly current: number };

/** La caméra glisse vers le cadrage de l'onglet (ou s'y place d'un coup sans animation). */
function CameraRig({
  framing,
  scale,
  animated,
}: {
  framing: Framing;
  scale: number;
  animated: boolean;
}) {
  const camera = useThree((s) => s.camera);
  const rig = useMemo(() => ({ aim: new THREE.Vector3(), goal: new THREE.Vector3() }), []);
  // La première image place la caméra d'un coup ; ensuite, elle glisse.
  const placed = useRef(false);
  useFrame((_, delta) => {
    const shot = previewShot(framing, scale);
    const k = animated && placed.current ? 1 - Math.exp(-delta * 6) : 1;
    camera.position.lerp(rig.goal.set(...shot.from), k);
    rig.aim.lerp(rig.goal.set(...shot.aim), k);
    camera.lookAt(rig.aim);
    placed.current = true;
  });
  return null;
}

function Turning({
  turn,
  animated,
  children,
}: {
  turn: Turn;
  animated: boolean;
  children: ReactNode;
}) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const k = animated ? 1 - Math.exp(-delta * 12) : 1;
    g.rotation.y += (turn.current - g.rotation.y) * k;
  });
  return <group ref={group}>{children}</group>;
}

const SHADOW_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SHADOW_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    float r = length(vUv - 0.5) * 2.0;
    gl_FragColor = vec4(uColor, 0.3 * (1.0 - smoothstep(0.15, 1.0, r)));
  }
`;

/** Ombre douce et ronde sous les pieds : la figurine se pose sur quelque chose. */
function GroundShadow() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uColor: { value: new THREE.Color(avatarArt.shadow) } },
        vertexShader: SHADOW_VERTEX,
        fragmentShader: SHADOW_FRAGMENT,
        transparent: true,
        depthWrite: false,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} material={material}>
      <planeGeometry args={[0.75, 0.5]} />
    </mesh>
  );
}

type Props = {
  look: AvatarLook;
  framing: Framing;
  animation: AvatarAnimation;
  /** Faux si « Réduire les animations » est actif : figurine immobile, caméra sans glissement. */
  animated: boolean;
  /** Faux quand l'écran est caché ou l'app en arrière-plan : aucune image n'est calculée. */
  active: boolean;
  turn: Turn;
};

/** Aperçu 3D de l'éditeur : la figurine sur son ombre, cadrée selon l'onglet. */
export function AvatarPreview({ look, framing, animation, animated, active, turn }: Props) {
  return (
    <Canvas
      style={StyleSheet.absoluteFill}
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ fov: 30 }}>
      <AvatarLights />
      <CameraRig framing={framing} scale={avatarScale(look)} animated={animated} />
      <GroundShadow />
      <Turning turn={turn} animated={animated}>
        <Avatar3D look={look} animation={animation} animated={animated} />
      </Turning>
    </Canvas>
  );
}
