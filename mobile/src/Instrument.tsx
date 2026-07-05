import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { theme } from './theme';
import { LAT } from './mock';
import { bewegingVerminderd } from './beweging';
import { useLetters } from './letters';

/* Het weeginstrument: dezelfde signature als de site (slot 3, FATHOM-les),
 * vertaald naar het dossier-scherm. Groot tellend mono-cijfer plus een
 * score-rail 0-100 met de vaste lat-markering op 70. Telt discreet per
 * weegmoment (geen scrubbing, les B2) en is volledig omkeerbaar (les A12):
 * de waarde volgt de state, welke kant die ook op gaat.
 * Reduced-motion: cijfer en rail staan direct op de eindstand. */

export function Instrument({ waarde, licht = false }: { waarde: number; licht?: boolean }) {
  const letters = useLetters();
  const anim = useRef(new Animated.Value(bewegingVerminderd() ? waarde : 0)).current;
  const [toon, setToon] = useState(bewegingVerminderd() ? waarde : 0);
  const [railBreedte, setRailBreedte] = useState(0);

  useEffect(() => {
    const id = anim.addListener(({ value }) => setToon(Math.round(value)));
    return () => anim.removeListener(id);
  }, [anim]);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: waarde,
      duration: bewegingVerminderd() ? 0 : 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // tellend cijfer en vulbreedte kunnen niet native
    }).start();
  }, [waarde, anim]);

  const inkKleur = licht ? theme.verdictInk : theme.ink;
  const stilKleur = licht ? theme.verdictInk62 : theme.ink62;
  const railKleur = licht ? theme.verdictHair : theme.hair;

  return (
    <View accessible accessibilityLabel={`Venture-score ${waarde} van 100, de lat ligt op ${LAT}`}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
        <Text style={{
          fontFamily: letters.mono, fontVariant: ['tabular-nums'], fontSize: 76,
          lineHeight: 82, color: inkKleur, letterSpacing: -2,
        }}>
          {String(toon).padStart(2, '0')}
        </Text>
        <Text style={{
          fontFamily: letters.mono, fontSize: 11, letterSpacing: 1.2,
          textTransform: 'uppercase', color: stilKleur,
        }}>
          venture-score
        </Text>
      </View>

      {/* De rail: 0-100, vulling in accent, de lat als vaste markering. */}
      <View
        onLayout={(e) => setRailBreedte(e.nativeEvent.layout.width)}
        style={{ height: 6, borderRadius: 3, backgroundColor: railKleur, marginTop: 14, overflow: 'visible' }}
      >
        <Animated.View style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 3,
          backgroundColor: theme.accent,
          width: railBreedte > 0
            ? anim.interpolate({ inputRange: [0, 100], outputRange: [0, railBreedte], extrapolate: 'clamp' })
            : 0,
        }} />
        {railBreedte > 0 && (
          <View style={{
            position: 'absolute', left: railBreedte * (LAT / 100) - 1, top: -5, bottom: -5,
            width: 2, backgroundColor: inkKleur, opacity: 0.8,
          }} />
        )}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
        <Text style={{ fontFamily: letters.mono, fontSize: 10.5, letterSpacing: 0.8, color: stilKleur }}>00</Text>
        <Text style={{
          fontFamily: letters.mono, fontSize: 10.5, letterSpacing: 0.8, color: stilKleur,
          position: 'absolute', left: railBreedte > 0 ? railBreedte * (LAT / 100) - 26 : 0, top: 8,
        }}>
          de lat · {LAT}
        </Text>
        <Text style={{ fontFamily: letters.mono, fontSize: 10.5, letterSpacing: 0.8, color: stilKleur }}>100</Text>
      </View>
    </View>
  );
}

/* WeegRegel: een as op het dossier-scherm. De rail klikt aan zodra de as
 * gewogen is (zelfde beeld als de weegmomenten op de site); tot die tijd
 * staat de regel stil in de wachtstand. */
export function WeegRegel({ label, regel, gewicht, max, noot, gewogen, index }: {
  label: string; regel: string; gewicht: number; max: number; noot: string;
  gewogen: boolean; index: number;
}) {
  const letters = useLetters();
  const anim = useRef(new Animated.Value(bewegingVerminderd() && gewogen ? 1 : 0)).current;
  const [breedte, setBreedte] = useState(0);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: gewogen ? 1 : 0,
      duration: bewegingVerminderd() ? 0 : 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [gewogen, anim]);

  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${gewogen ? `plus ${gewicht} van ${max}, ${noot}` : 'wordt gewogen'}`}
      style={{
        backgroundColor: theme.panel, borderRadius: theme.radius, padding: 16, marginTop: 12,
        opacity: 1,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{
          fontFamily: letters.mono, fontSize: 10.5, letterSpacing: 1.2, color: theme.ink62,
        }}>
          {label}
        </Text>
        <Text style={{
          fontFamily: letters.mono, fontVariant: ['tabular-nums'], fontSize: 15,
          color: gewogen ? theme.accent : theme.ink45, fontWeight: '700',
        }}>
          {gewogen ? `+${gewicht}` : '··'}
        </Text>
      </View>
      <Text style={{ fontSize: 14.5, color: theme.ink, lineHeight: 21, marginTop: 8 }}>{regel}</Text>
      <View
        onLayout={(e) => setBreedte(e.nativeEvent.layout.width)}
        style={{ height: 4, borderRadius: 2, backgroundColor: theme.hair2, marginTop: 12 }}
      >
        <Animated.View style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 2,
          backgroundColor: theme.accent,
          width: breedte > 0
            ? anim.interpolate({ inputRange: [0, 1], outputRange: [0, breedte * (gewicht / max)] })
            : 0,
        }} />
      </View>
      <Text style={{
        fontFamily: letters.mono, fontSize: 10.5, letterSpacing: 0.8, textTransform: 'uppercase',
        color: gewogen ? theme.ink62 : theme.ink45, marginTop: 8,
      }}>
        {gewogen ? noot : `weging ${index + 1} van 3 · wacht`}
      </Text>
    </View>
  );
}
