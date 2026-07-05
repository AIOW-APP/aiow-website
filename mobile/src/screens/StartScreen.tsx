import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { theme } from '../theme';
import { Orb } from '../Orb';
import { s, Kicker, Statement, Btn, Tik, Verschijn } from '../ui';

/* Start: de aanvraag ligt nog niet op tafel. De orb is het enige grote
 * visuele element (slot 1: het instrument is het beeld), daaronder de
 * merkstem en precies een primaire actie (les A16). "Mijn weging" en het
 * partner-kanaal zijn stille regels; in v1 openen ze de demo-dossiers. */

export function StartScreen({ onIntake, onWeging, onPartner }: {
  onIntake: () => void;
  onWeging: () => void;
  onPartner: () => void;
}) {
  return (
    <ScrollView style={s.screen} contentContainerStyle={[s.wrap, { paddingTop: 8 }]}>
      <Verschijn index={0}>
        <View style={{ alignItems: 'center', marginTop: 18, marginBottom: 22 }}>
          <Orb grootte={186} />
        </View>
      </Verschijn>

      <Verschijn index={1}>
        <Kicker>AIOW · AI venture partner</Kicker>
        <Statement groot>
          Wij bouwen niet voor bedrijven. Wij bouwen mee aan bedrijven.
        </Statement>
        <Text style={s.lead}>
          AIOW toetst elk idee zoals een investeerder dat doet, en bouwt alleen mee
          als we er zelf in geloven. De intake kost drie stappen; het verdict valt
          binnen 48 uur, als melding op dit toestel.
        </Text>
      </Verschijn>

      <Verschijn index={2}>
        <Btn title="Vraag je venture-score aan" onPress={onIntake} style={{ marginTop: 22 }} />
      </Verschijn>

      <Verschijn index={3}>
        <View style={{ marginTop: 26, borderTopWidth: 1, borderTopColor: theme.hair2 }}>
          <Tik
            onPress={onWeging}
            stijl={{ minHeight: 56, justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: theme.hair2 }}
            ingedruktStijl={{ opacity: 0.55 }}
            accessibilityLabel="Mijn weging"
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 15.5, fontWeight: '600', color: theme.ink }}>Mijn weging</Text>
              <Kicker>dossier-scherm</Kicker>
            </View>
          </Tik>
          <Tik
            onPress={onPartner}
            stijl={{ minHeight: 56, justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: theme.hair2 }}
            ingedruktStijl={{ opacity: 0.55 }}
            accessibilityLabel="Partner-kanaal"
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 15.5, fontWeight: '600', color: theme.ink }}>Partner-kanaal</Text>
              <Kicker>alleen na een ja</Kicker>
            </View>
          </Tik>
        </View>
      </Verschijn>

      <Verschijn index={4}>
        <Text style={{ fontSize: 12.5, color: theme.ink62, marginTop: 22, lineHeight: 18 }}>
          Wij zeggen vaker nee dan ja. Daarom is ons ja iets waard.
        </Text>
      </Verschijn>
    </ScrollView>
  );
}
