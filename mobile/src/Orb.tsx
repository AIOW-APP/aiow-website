import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import { theme } from './theme';
import { bewegingVerminderd } from './beweging';

/* Spunky, de beoordelaar: hetzelfde asset-systeem-in-code als de site (geen
 * fotografie, geen icon-sets; het beeld van AIOW is de orb en zijn afgeleiden,
 * les A9). Ademhaling + iris-puls vormen samen ambient-loop 1 van maximaal 1
 * per scherm in de app; `denkt` verdiept de iris-puls tijdens de weging.
 * Kleuren in sRGB (de oklch-mix dreef richting violet, verboden terrein).
 * Reduced-motion: stil en compleet. */

export function Orb({ grootte = 168, denkt = false }: { grootte?: number; denkt?: boolean }) {
  const adem = useRef(new Animated.Value(0)).current;
  const iris = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (bewegingVerminderd()) return;
    const ademLoop = Animated.loop(Animated.sequence([
      Animated.timing(adem, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(adem, { toValue: 0, duration: 2600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]));
    ademLoop.start();
    return () => ademLoop.stop();
  }, [adem]);

  useEffect(() => {
    if (bewegingVerminderd()) return;
    const duur = denkt ? 700 : 1600;
    const irisLoop = Animated.loop(Animated.sequence([
      Animated.timing(iris, { toValue: 1, duration: duur, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(iris, { toValue: 0, duration: duur, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]));
    irisLoop.start();
    return () => irisLoop.stop();
  }, [iris, denkt]);

  const kern = grootte * 0.42;
  const irisMaat = grootte * 0.16;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: grootte, height: grootte, alignItems: 'center', justifyContent: 'center' }}
    >
      {/* Halo: het zachtste licht, ademt mee. */}
      <Animated.View style={{
        position: 'absolute', width: grootte, height: grootte, borderRadius: grootte,
        backgroundColor: theme.accentSoft,
        transform: [{ scale: adem.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) }],
        opacity: adem.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }),
      }} />
      {/* Buitenring: haarlijn, het glas om het wezen. */}
      <View style={{
        position: 'absolute', width: grootte * 0.78, height: grootte * 0.78, borderRadius: grootte,
        borderWidth: 1, borderColor: 'rgba(0,103,129,0.22)', backgroundColor: '#FFFFFF',
      }} />
      {/* Kern: verdict-petrol, het kernlicht bij daglicht ingedikt. */}
      <Animated.View style={{
        width: kern, height: kern, borderRadius: kern,
        backgroundColor: theme.accent,
        alignItems: 'center', justifyContent: 'center',
        transform: [{ scale: adem.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] }) }],
        shadowColor: theme.accent, shadowOpacity: 0.35, shadowRadius: 18, shadowOffset: { width: 0, height: 6 },
        elevation: 6,
      }}>
        {/* Iris: pulseert zacht als denken; sneller wanneer er gewogen wordt. */}
        <Animated.View style={{
          width: irisMaat, height: irisMaat, borderRadius: irisMaat,
          backgroundColor: '#F2F6F7',
          opacity: iris.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0.95] }),
          transform: [{ scale: iris.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.08] }) }],
        }} />
      </Animated.View>
    </View>
  );
}
