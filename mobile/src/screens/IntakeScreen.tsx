import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { theme } from '../theme';
import { Orb } from '../Orb';
import { voel } from '../voel';
import {
  FASE_OPTIES, DOEL_OPTIES, LEGE_AANVRAAG, type Aanvraag,
} from '../mock';
import { s, Kicker, Statement, Btn, Tik, Verschijn, OptieKaart, Veld, FoutRegel } from '../ui';

/* Intake: dezelfde drie stappen als de webflow (een bron van copy en
 * validatie-merkstem), met haptiek per bewuste druk (Bisnix-les) en de orb
 * die meeleest. Een vraaggroep per stap, een primaire CTA op een vaste plek
 * met morfend label (les A16); terug is het stillere register en de flow is
 * verliesvrij omkeerbaar (les A12).
 * HANDOFF(Handsome): submit levert de aanvraag aan de app-state; zodra het
 * venture-score-endpoint bestaat gaat hier een POST heen (zelfde open punt
 * als de mailto-fallback op de site). */

const TITELS = ['Je idee', 'Waar je staat', 'Wie je bent'] as const;
const TOTAAL_STAPPEN = 3;

export function IntakeScreen({ onKlaar }: { onKlaar: (aanvraag: Aanvraag) => void }) {
  const [stap, setStap] = useState(1);
  const [vorm, setVorm] = useState<Aanvraag>(LEGE_AANVRAAG);
  const [fout, setFout] = useState('');

  const zet = (veld: keyof Aanvraag) => (waarde: string) => {
    setVorm((huidig) => ({ ...huidig, [veld]: waarde }));
    setFout('');
  };

  const valideer = (huidige: number): string => {
    if (huidige === 1) {
      if (vorm.idee.trim().length < 20) return 'Beschrijf je idee of bedrijf in ongeveer 3 zinnen, dan kan Spunky er echt iets van vinden.';
      if (!vorm.branche.trim()) return 'Vul je branche in, een woord is genoeg.';
    }
    if (huidige === 2) {
      if (!vorm.fase) return 'Kies waar je nu staat, dan weegt de score eerlijk.';
      if (!vorm.doel) return 'Kies wat je zoekt: bouwen of groeien.';
    }
    if (huidige === 3) {
      if (!vorm.naam.trim()) return 'Vul je naam in, we beoordelen founders, geen formulieren.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vorm.email.trim())) return 'Dat e-mailadres klopt nog niet helemaal, kijk er even naar.';
    }
    return '';
  };

  const verder = () => {
    const melding = valideer(stap);
    if (melding) {
      voel.waarschuw();
      setFout(melding);
      return;
    }
    setFout('');
    if (stap < TOTAAL_STAPPEN) {
      setStap(stap + 1);
      return;
    }
    voel.succes();
    onKlaar(vorm);
  };

  const terug = () => {
    setFout('');
    setStap((huidige) => Math.max(1, huidige - 1));
  };

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Kicker>Stap {stap} van {TOTAAL_STAPPEN} · {TITELS[stap - 1]}</Kicker>
          {/* Voortgang: drie stille segmenten, geen procenten-theater. */}
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
            {TITELS.map((titel, i) => (
              <View key={titel} style={{
                flex: 1, height: 3, borderRadius: 2,
                backgroundColor: i < stap ? theme.accent : theme.hair,
              }} />
            ))}
          </View>
        </View>
        {/* De orb leest mee, klein en aanwezig. */}
        <Orb grootte={56} denkt={stap === TOTAAL_STAPPEN} />
      </View>

      {/* key = stap: elke stap komt met dezelfde rustige choreografie binnen. */}
      <View key={stap}>
        {stap === 1 && (
          <Verschijn index={0}>
            <Statement>Waar bouw je aan?</Statement>
            <Veld
              label="Je idee of bedrijf, in ongeveer 3 zinnen"
              waarde={vorm.idee}
              onChange={zet('idee')}
              meerregelig
              placeholder="Wat maak je, voor wie, en wat is er al?"
            />
            <Veld label="Branche" waarde={vorm.branche} onChange={zet('branche')} placeholder="Een woord is genoeg" />
          </Verschijn>
        )}

        {stap === 2 && (
          <Verschijn index={0}>
            <Statement>Waar sta je nu?</Statement>
            {FASE_OPTIES.map((optie) => (
              <OptieKaart
                key={optie.value}
                label={optie.label}
                hint={optie.hint}
                gekozen={vorm.fase === optie.value}
                onKies={() => zet('fase')(optie.value)}
              />
            ))}
            <Text style={[s.label, { marginTop: 22 }]}>En wat zoek je?</Text>
            {DOEL_OPTIES.map((optie) => (
              <OptieKaart
                key={optie.value}
                label={optie.label}
                hint={optie.hint}
                gekozen={vorm.doel === optie.value}
                onKies={() => zet('doel')(optie.value)}
              />
            ))}
          </Verschijn>
        )}

        {stap === 3 && (
          <Verschijn index={0}>
            <Statement>Wie legt dit voor?</Statement>
            <Veld label="Naam" waarde={vorm.naam} onChange={zet('naam')} />
            <Veld label="E-mail" waarde={vorm.email} onChange={zet('email')} keyboard="email-address" />
            <Veld label="KvK-nummer (optioneel)" waarde={vorm.kvk} onChange={zet('kvk')} keyboard="numeric" />
            <Text style={{ fontSize: 12.5, color: theme.ink62, marginTop: 14, lineHeight: 18 }}>
              Binnen 48 uur een eerlijke uitslag. Vaker nee dan ja; altijd met een
              concrete tip.
            </Text>
          </Verschijn>
        )}
      </View>

      <FoutRegel tekst={fout} />

      <Btn
        title={stap < TOTAAL_STAPPEN ? 'Volgende' : 'Leg voor aan Spunky'}
        onPress={verder}
        style={{ marginTop: 24 }}
      />
      {stap > 1 && (
        <Tik
          onPress={terug}
          buiten={{ marginTop: 6 }}
          stijl={{ minHeight: 44, alignItems: 'center', justifyContent: 'center' }}
          ingedruktStijl={{ opacity: 0.55 }}
          accessibilityLabel="Vorige stap"
        >
          <Text style={{ color: theme.ink62, fontSize: 14.5, fontWeight: '600' }}>Vorige stap</Text>
        </Tik>
      )}
    </ScrollView>
  );
}
