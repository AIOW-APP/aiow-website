import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, Animated, Easing,
  type ViewStyle, type TextStyle, type StyleProp,
} from 'react-native';
import { theme } from './theme';
import { voel } from './voel';
import { bewegingVerminderd } from './beweging';
import { useLetters } from './letters';

/* Gedeelde primitieven naar Tisnix-app-patroon, met AIOW-tokens en het
 * kalm-water-motion-karakter uit het DNA: druk-fysica op elke bewuste druk
 * (scale .985), gestaffelde binnenkomst met betekenis, een CTA per scherm
 * op een vaste plek met morfend label (les A16), kleur als grammatica
 * (les A14: accent = actie, rood = uitsluitend fout). Tap-doelen >= 44px. */

export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.bg },
  wrap: { padding: 20, paddingBottom: 110 },
  lead: { fontSize: 15, color: theme.ink62, lineHeight: 22, marginTop: 10 },
  label: { fontWeight: '600', fontSize: 13.5, color: theme.ink, marginTop: 14 },
  input: {
    borderWidth: 1, borderColor: theme.hair, borderRadius: 10, backgroundColor: theme.panel,
    padding: 12, fontSize: 15.5, color: theme.ink, marginTop: 6, minHeight: 44,
  },
  card: { backgroundColor: theme.panel, borderRadius: theme.radius, padding: 16, marginTop: 12 },
});

/* Microlabel: DM Mono caps, tracking, nooit body (les B5). */
export function Kicker({ children, licht, style }: {
  children: React.ReactNode; licht?: boolean; style?: StyleProp<TextStyle>;
}) {
  const letters = useLetters();
  return (
    <Text style={[{
      fontFamily: letters.mono, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase',
      color: licht ? theme.verdictInk62 : theme.ink62,
    }, style]}>
      {children}
    </Text>
  );
}

/* Chapter-statement: Literata, een korte zin, links uitgelijnd (les A2). */
export function Statement({ children, licht, groot, style }: {
  children: React.ReactNode; licht?: boolean; groot?: boolean; style?: StyleProp<TextStyle>;
}) {
  const letters = useLetters();
  return (
    <Text style={[{
      fontFamily: letters.display, fontSize: groot ? 30 : 23, lineHeight: groot ? 37 : 30,
      color: licht ? theme.verdictInk : theme.ink, marginTop: 8, letterSpacing: -0.3,
    }, style]}>
      {children}
    </Text>
  );
}

/* Mono-waarde (score, stats): altijd tabular zodat niets verspringt. */
export function MonoWaarde({ children, stijl }: { children: React.ReactNode; stijl?: StyleProp<TextStyle> }) {
  const letters = useLetters();
  return (
    <Text style={[{ fontFamily: letters.mono, fontVariant: ['tabular-nums'], color: theme.ink }, stijl]}>
      {children}
    </Text>
  );
}

/* Tik: de ene druk-feedback voor de hele app (scale .985 + selection-haptiek). */
export function Tik({ onPress, disabled, stijl, ingedruktStijl, buiten, hitSlop, accessibilityLabel, children }: {
  onPress: () => void;
  disabled?: boolean;
  stijl?: StyleProp<ViewStyle>;
  ingedruktStijl?: StyleProp<ViewStyle>;
  buiten?: StyleProp<ViewStyle>;
  hitSlop?: number;
  accessibilityLabel?: string;
  children: React.ReactNode;
}) {
  const schaal = useRef(new Animated.Value(1)).current;
  const naar = (v: number) =>
    Animated.timing(schaal, {
      toValue: v, duration: bewegingVerminderd() ? 0 : 120,
      easing: Easing.out(Easing.quad), useNativeDriver: true,
    }).start();
  return (
    <Animated.View style={[buiten, { transform: [{ scale: schaal }] }]}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        hitSlop={hitSlop}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPressIn={() => { if (!disabled) { naar(0.985); voel.tik(); } }}
        onPressOut={() => naar(1)}
        style={({ pressed }) => [stijl, pressed && !disabled ? ingedruktStijl : null]}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

/* Verschijn: gestaffelde binnenkomst in leesvolgorde (les A3), eenmalig. */
export function Verschijn({ index = 0, children }: { index?: number; children: React.ReactNode }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: bewegingVerminderd() ? 0 : 320,
      delay: bewegingVerminderd() ? 0 : index * 90,
      easing: Easing.out(Easing.cubic), useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Animated.View style={{
      opacity: anim,
      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
    }}>
      {children}
    </Animated.View>
  );
}

const btnStijl = StyleSheet.create({
  basis: { borderRadius: 14, paddingVertical: 15, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', minHeight: 52 },
  accent: { backgroundColor: theme.accent },
  lijn: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: theme.hair },
  tekst: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  tekstLijn: { color: theme.ink, fontWeight: '600', fontSize: 15 },
});

/* Btn: per scherm precies een gevulde primaire actie op een vaste plek,
 * label morft mee met de context (les A16); secundair is altijd stiller. */
export function Btn({ title, onPress, disabled, tone = 'accent', style }: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'accent' | 'lijn';
  style?: ViewStyle;
}) {
  const vlak = tone === 'lijn' ? btnStijl.lijn : btnStijl.accent;
  const tekst = tone === 'lijn' ? btnStijl.tekstLijn : btnStijl.tekst;
  const donker: ViewStyle = tone === 'lijn'
    ? { backgroundColor: theme.hair2 }
    : { backgroundColor: theme.accentDonker };
  return (
    <Tik
      onPress={onPress}
      disabled={disabled}
      buiten={[{ marginTop: 12 }, style]}
      stijl={[btnStijl.basis, vlak, disabled && { opacity: 0.4 }]}
      ingedruktStijl={donker}
      accessibilityLabel={title}
    >
      <Text style={tekst}>{title}</Text>
    </Tik>
  );
}

/* Statuschip die fases vertelt (les A17): een vast geplaatst element dat de
 * echte fase benoemt; de laatste staat is het resultaat of een uitnodiging. */
export function FaseChip({ tekst, actief, licht }: { tekst: string; actief?: boolean; licht?: boolean }) {
  const letters = useLetters();
  const kleur = licht ? theme.verdictInk : actief ? theme.accent : theme.ink62;
  return (
    <View style={{
      alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7,
      borderWidth: 1, borderColor: licht ? theme.verdictHair : actief ? 'rgba(0,103,129,0.25)' : theme.hair,
      backgroundColor: licht ? 'rgba(242,246,247,0.06)' : actief ? theme.accentSoft : theme.hair2,
      borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, minHeight: 28,
    }}>
      {actief ? <AdemDot kleur={theme.accent} /> : null}
      <Text style={{
        fontFamily: letters.mono, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase',
        color: kleur, fontVariant: ['tabular-nums'],
      }}>
        {tekst}
      </Text>
    </View>
  );
}

/* AdemDot: rustige ademhaling; onderdeel van de ene ambient-loop per scherm. */
export function AdemDot({ kleur = theme.accent }: { kleur?: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (bewegingVerminderd()) return;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: 1300, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0, duration: 1300, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [anim]);
  return (
    <Animated.View
      accessibilityElementsHidden
      style={{
        width: 7, height: 7, borderRadius: 99, backgroundColor: kleur,
        opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.35] }),
      }}
    />
  );
}

/* OptieKaart: intake-keuze met label en hint; selectie = accent-haarlijn,
 * geen extra kleuren (les A14). Tap-doel ruim boven 44px. */
export function OptieKaart({ label, hint, gekozen, onKies }: {
  label: string; hint: string; gekozen: boolean; onKies: () => void;
}) {
  return (
    <Tik
      onPress={onKies}
      buiten={{ marginTop: 10 }}
      stijl={[{
        backgroundColor: theme.panel, borderRadius: 12, padding: 14, minHeight: 60,
        borderWidth: 1.5, borderColor: gekozen ? theme.accent : theme.hair,
      }, gekozen && { backgroundColor: theme.accentSoft }]}
      ingedruktStijl={{ borderColor: theme.accent }}
      accessibilityLabel={label}
    >
      <Text style={{ fontSize: 15.5, fontWeight: '600', color: gekozen ? theme.accent : theme.ink }}>{label}</Text>
      <Text style={{ fontSize: 13, color: theme.ink62, marginTop: 3 }}>{hint}</Text>
    </Tik>
  );
}

export function Veld({ label, waarde, onChange, meerregelig, keyboard, placeholder }: {
  label: string;
  waarde: string;
  onChange: (v: string) => void;
  meerregelig?: boolean;
  keyboard?: 'numeric' | 'email-address' | 'default';
  placeholder?: string;
}) {
  return (
    <View>
      <Text style={s.label}>{label}</Text>
      <TextInput
        style={[s.input, meerregelig && { minHeight: 96, textAlignVertical: 'top' }]}
        value={waarde}
        onChangeText={onChange}
        multiline={meerregelig}
        keyboardType={keyboard ?? 'default'}
        placeholder={placeholder}
        autoCapitalize="none"
        placeholderTextColor={theme.ink45}
      />
    </View>
  );
}

/* Validatie: foutkleur-haarlijn plus een zin die zegt wat er mist en hoe
 * verder, in merkstem; rood uitsluitend hier (les A14). */
export function FoutRegel({ tekst }: { tekst: string }) {
  if (!tekst) return null;
  return (
    <View style={{
      marginTop: 14, borderLeftWidth: 2, borderLeftColor: theme.fout,
      backgroundColor: theme.foutSoft, borderRadius: 8, padding: 12,
    }}>
      <Text style={{ color: theme.fout, fontSize: 13.5, lineHeight: 19 }}>{tekst}</Text>
    </View>
  );
}

export function Kaart({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.card, style]}>{children}</View>;
}
