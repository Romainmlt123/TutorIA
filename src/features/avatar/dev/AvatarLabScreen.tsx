import { Canvas, useThree } from '@react-three/fiber';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { SceneBoundary } from '@/lib/three/SceneBoundary';
import { canUseWebGL } from '@/lib/three/webgl';
import { theme } from '@/theme';

import { Avatar3D, AvatarLights, type AvatarAnimation } from '../avatar3d/Avatar3D';
import {
  BROW_STYLES,
  EYE_STYLES,
  MOUTH_STYLES,
  NOSE_STYLES,
  randomLook,
  type AvatarLook,
} from '../logic/avatarLook';

const ANIMATIONS: readonly AvatarAnimation[] = ['attente', 'marche', 'salut', 'saut', 'attente'];

/** Caméra posée une fois : regarde le point `aim` depuis `from`. */
function Aim({ from, aim }: { from: readonly number[]; aim: readonly number[] }) {
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    camera.position.set(from[0]!, from[1]!, from[2]!);
    camera.lookAt(aim[0]!, aim[1]!, aim[2]!);
    camera.updateProjectionMatrix();
  }, [camera, from, aim]);
  return null;
}

const ROW_CAMERA = { from: [0, 1.0, 7.5], aim: [0, 0.5, 0] } as const;
const FACE_CAMERA = { from: [0, 1.1, 4.4], aim: [0, 0.98, 0] } as const;

/** Six visages différents, pour vérifier chaque forme d'yeux, de sourcils, de nez et de bouche. */
function faceLooks(seed: number): AvatarLook[] {
  return EYE_STYLES.map((eyes, k) => {
    const base = randomLook(seed * 31 + k);
    return {
      ...base,
      eyes: { ...base.eyes, style: eyes },
      brows: BROW_STYLES[(k + seed) % BROW_STYLES.length]!,
      mouth: MOUTH_STYLES[(k + 2 * seed) % MOUTH_STYLES.length]!,
      nose: NOSE_STYLES[(k + seed) % NOSE_STYLES.length]!,
      freckles: k % 3 === 1,
      size: 0.5,
    };
  });
}

function Row({ seed }: { seed: number }) {
  return (
    <>
      <Aim {...ROW_CAMERA} />
      {ANIMATIONS.map((animation, k) => (
        <Avatar3D
          key={k}
          look={randomLook(seed * 10 + k)}
          animation={animation}
          position={[(k - 2) * 0.62, 0, 0]}
        />
      ))}
    </>
  );
}

function Faces({ seed }: { seed: number }) {
  return (
    <>
      <Aim {...FACE_CAMERA} />
      {faceLooks(seed).map((look, k) => (
        <Avatar3D
          key={k}
          look={look}
          position={[((k % 3) - 1) * 0.5, k < 3 ? 0.6 : -0.02, k < 3 ? -0.6 : 0]}
        />
      ))}
    </>
  );
}

const noSubscription = () => () => undefined;

/**
 * Laboratoire des avatars (développement seulement) : une rangée de figurines tirées au hasard,
 * chacune avec son animation, ou (?vue=visages) six visages de près. « Autres avatars » en tire
 * d'autres.
 */
export function AvatarLabScreen() {
  const { vue } = useLocalSearchParams<{ vue?: string }>();
  const webgl = useSyncExternalStore(noSubscription, canUseWebGL, () => false);
  const [seed, setSeed] = useState(1);
  const faces = vue === 'visages';
  return (
    <View style={styles.screen} collapsable={false}>
      {webgl ? (
        <SceneBoundary scope="avatar.lab" fallback={null}>
          <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true }} camera={{ fov: 30 }}>
            <AvatarLights />
            {faces ? <Faces seed={seed} /> : <Row seed={seed} />}
          </Canvas>
        </SceneBoundary>
      ) : null}
      <View style={styles.hud}>
        <Text variant="caption" weight="bold">
          {webgl
            ? `Avatars · ${faces ? 'visages' : 'animations'} · tirage ${seed}`
            : 'WebGL indisponible'}
        </Text>
        <Button label="Autres avatars" onPress={() => setSeed((s) => s + 1)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg },
  hud: {
    position: 'absolute',
    top: theme.space[12],
    left: theme.space[4],
    right: theme.space[4],
    gap: theme.space[2],
    alignItems: 'flex-start',
  },
});
