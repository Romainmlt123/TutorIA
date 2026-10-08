import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { Icon } from '@/components/Icon';
import { IconButton } from '@/components/IconButton';
import { PressableBase } from '@/components/PressableBase';
import { ScreenBand } from '@/components/ScreenBand';
import { Text } from '@/components/Text';
import type { AvatarAnimation } from '@/features/avatar/avatar3d/Avatar3D';
import { AvatarPreview } from '@/features/avatar/avatar3d/AvatarPreview';
import type { AvatarLook } from '@/features/avatar/logic/avatarLook';
import { fr } from '@/i18n/fr';
import { SceneBoundary } from '@/lib/three/SceneBoundary';
import { useSceneActive } from '@/lib/three/useSceneActive';
import { useSceneKey } from '@/lib/three/useSceneKey';
import { canUseWebGL } from '@/lib/three/webgl';
import { extras, theme } from '@/theme';

const t = fr.profile;
const H = theme.profile.hero;
/** Le résumé déborde de 72 px sur le bas du bandeau. */
export const PROFILE_OVERLAP = 72;
/** Durée du salut à l'arrivée, avant l'attente. */
const GREETING_MS = 1500;
/** Face à l'élève : la figurine ne tourne pas sur le profil. */
const FRONT = { current: 0 } as const;

type Props = {
  firstName: string;
  grade: string | null;
  /** Mois d'arrivée, déjà mis en forme (« septembre »). */
  sinceMonth: string | null;
  look: AvatarLook | null;
  /** L'apparence est encore lue : ni initiale ni figurine, pour ne pas montrer l'une puis l'autre. */
  lookLoading: boolean;
  /** Nouveautés de la garde-robe pas encore vues. */
  news: number;
  onBack: () => void;
  onAvatar: () => void;
};

/** La figurine en pied, qui salue à l'arrivée sur l'écran puis attend ; l'initiale sans avatar. */
function Figure({
  look,
  loading,
  firstName,
}: {
  look: AvatarLook | null;
  loading: boolean;
  firstName: string;
}) {
  const reduceMotion = useReducedMotion();
  const active = useSceneActive();
  const sceneKey = useSceneKey();
  const [animation, setAnimation] = useState<AvatarAnimation>('salut');
  useEffect(() => {
    const timer = setTimeout(() => setAnimation('attente'), GREETING_MS);
    return () => clearTimeout(timer);
  }, []);

  const initial = (
    <View style={styles.initial}>
      <Text variant="display" color="primary">
        {firstName.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={t.avatarLabel(firstName)}
      style={styles.figure}>
      <View aria-hidden style={styles.halo} />
      <View aria-hidden style={styles.ground} />
      {loading ? null : look && canUseWebGL() ? (
        <SceneBoundary key={sceneKey} scope="profile.avatar" fallback={initial}>
          <AvatarPreview
            look={look}
            framing="body"
            animation={animation}
            animated={!reduceMotion}
            active={active}
            turn={FRONT}
          />
        </SceneBoundary>
      ) : (
        initial
      )}
    </View>
  );
}

/**
 * Bandeau du profil (ProfileHero, v2.8) : « Mon profil », le prénom, la classe, la date d'arrivée,
 * le bouton de l'avatar avec ses nouveautés, et la figurine de l'élève à droite.
 */
export function ProfileHero(props: Props) {
  const { firstName, grade, sinceMonth, look, lookLoading, news, onBack, onAvatar } = props;
  return (
    <ScreenBand tone="student" overlap={PROFILE_OVERLAP} accessibilityLabel={t.kicker}>
      <Figure look={look} loading={lookLoading} firstName={firstName} />
      <View style={styles.back}>
        <IconButton
          icon="chevron-gauche"
          onBand
          accessibilityLabel={fr.form.back}
          onPress={onBack}
        />
      </View>
      <View style={styles.texts}>
        <Text variant="overline" weight="bold" color="textOnColor" style={styles.soft}>
          {t.kicker}
        </Text>
        <Text variant="display" color="textOnColor" accessibilityRole="header" numberOfLines={1}>
          {firstName}
        </Text>
        {grade ? (
          <View style={styles.grade}>
            <Icon name="casquette" size={16} color={theme.colors.textOnColor} strokeWidth={2} />
            <Text variant="hint" weight="bold" color="textOnColor">
              {t.studentOf(grade)}
            </Text>
          </View>
        ) : null}
        {sinceMonth ? (
          <Text variant="hint" weight="medium" color="textOnColor" style={styles.soft}>
            {t.since(sinceMonth)}
          </Text>
        ) : null}
        <PressableBase
          onPress={onAvatar}
          accessibilityRole="button"
          accessibilityLabel={
            news > 0 ? `${look ? t.avatarEdit : t.avatarCreate}, ${t.news(news)}` : undefined
          }
          style={({ pressed }) => [styles.avatarButton, pressed && styles.pressed]}>
          <Icon name="crayon" size={16} color={theme.palette.blue[600]} strokeWidth={2} />
          <Text variant="label" weight="bold" color={theme.palette.blue[600]}>
            {look ? t.avatarEdit : t.avatarCreate}
          </Text>
          {news > 0 ? (
            <View aria-hidden style={styles.badge}>
              <Text variant="caption" weight="black" color="textOnColor">
                {String(news)}
              </Text>
            </View>
          ) : null}
        </PressableBase>
      </View>
    </ScreenBand>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: 'flex-start' },
  texts: { maxWidth: 190, gap: theme.space[2], marginTop: theme.space[4] },
  soft: { opacity: 0.85 },
  grade: {
    alignSelf: 'flex-start',
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 10,
    paddingRight: theme.space[3],
    borderRadius: theme.radius.full,
    backgroundColor: theme.screenBand.controlVeil,
  },
  avatarButton: {
    alignSelf: 'flex-start',
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
    marginTop: theme.space[2],
    paddingLeft: theme.space[3],
    paddingRight: theme.space[4],
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    boxShadow: extras.call.avatarShadow,
  },
  pressed: { opacity: 0.85 },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: theme.radius.full,
    borderWidth: 2,
    borderColor: theme.colors.surface,
    backgroundColor: H.newsBadge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  figure: {
    position: 'absolute',
    right: 26,
    top: 50,
    width: H.figureWidth,
    height: H.figureHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: 250,
    height: 250,
    top: 20,
    borderRadius: theme.radius.full,
    backgroundColor: H.halo,
    opacity: 0.6,
  },
  ground: {
    position: 'absolute',
    bottom: -4,
    width: 130,
    height: 18,
    borderRadius: theme.radius.full,
    backgroundColor: extras.call.ground,
  },
  initial: {
    width: 120,
    height: 120,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
