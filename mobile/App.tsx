import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { theme } from './src/theme';
import { BRAND } from './src/brand';
import { useLetters } from './src/letters';
import { Tik } from './src/ui';
import { StartScreen } from './src/screens/StartScreen';
import { IntakeScreen } from './src/screens/IntakeScreen';
import { WegingScreen } from './src/screens/WegingScreen';
import { PartnerScreen } from './src/screens/PartnerScreen';
import type { Aanvraag } from './src/mock';

/*
 * AIOW-app v1: de venture-score in je zak (report §5). Drie schermen achter
 * een rustige start: intake (drie stappen, haptiek, de orb leest mee),
 * mijn weging (het dossier-scherm met het levende instrument en de push op
 * het verdict-moment) en het partner-kanaal (alleen na een ja).
 * Navigatie is bewust plat (state, geen navigator-dependency, zelfde keuze
 * als de Tisnix-app); terug navigeren reset een scherm volledig (les A12).
 *
 * Wordmark: Literata 700, het serif-merkdisplay. Bewust dezelfde open kwestie
 * als de site-header (serif vs. sans-register uit de header-standaard);
 * beslist Richard een keer, dan wisselen site en app samen.
 */

type Scherm = 'start' | 'intake' | 'weging' | 'partner';

export default function App({ initieelScherm = 'start' }: { initieelScherm?: Scherm }) {
  const [scherm, setScherm] = useState<Scherm>(initieelScherm);
  const [aanvraag, setAanvraag] = useState<Aanvraag | null>(null);
  const letters = useLetters();

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, paddingTop: 54 }}>
      <StatusBar style="dark" />

      {/* Kop: wordmark + testversie-chip (Bisnix-regel: testversies zijn
          zichtbaar test) + terug; alles minimaal 44px raakbaar. */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingBottom: 10, minHeight: 44,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{
            fontFamily: letters.displayBold, fontSize: 19, letterSpacing: -0.4, color: theme.ink,
          }}>
            {BRAND.naam}
          </Text>
          {BRAND.isTest && (
            <View style={{
              borderWidth: 1, borderColor: theme.hair, backgroundColor: theme.hair2,
              borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3,
            }}>
              <Text style={{
                fontFamily: letters.mono, fontSize: 9.5, letterSpacing: 1,
                color: theme.ink62, textTransform: 'uppercase',
              }}>
                {BRAND.chip}
              </Text>
            </View>
          )}
        </View>
        {scherm !== 'start' && (
          <Tik
            onPress={() => setScherm('start')}
            stijl={{ minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'flex-end' }}
            ingedruktStijl={{ opacity: 0.55 }}
            accessibilityLabel="Terug naar start"
          >
            <Text style={{ color: theme.accent, fontWeight: '700', fontSize: 14 }}>Start</Text>
          </Tik>
        )}
      </View>

      {scherm === 'start' && (
        <StartScreen
          onIntake={() => setScherm('intake')}
          onWeging={() => setScherm('weging')}
          onPartner={() => setScherm('partner')}
        />
      )}
      {scherm === 'intake' && (
        <IntakeScreen
          onKlaar={(nieuwe) => {
            setAanvraag(nieuwe);
            setScherm('weging');
          }}
        />
      )}
      {scherm === 'weging' && <WegingScreen aanvraag={aanvraag} />}
      {scherm === 'partner' && <PartnerScreen />}
    </View>
  );
}
