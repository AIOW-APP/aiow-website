import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { theme } from '../theme';
import { Orb } from '../Orb';
import { voel } from '../voel';
import { bewegingVerminderd } from '../beweging';
import { meldingAanzetten, verdictMelding } from '../meldingen';
import { Instrument, WeegRegel } from '../Instrument';
import {
  ASSEN, FASEN, faseIndex, DOSSIER_NR, LAT, TOTAAL, VERDICT,
  type WegingFase, type Aanvraag,
} from '../mock';
import { s, Kicker, Statement, Btn, FaseChip, Verschijn } from '../ui';

/* Mijn weging: het dossier-scherm en het bestaansrecht van de app (report §5).
 * Het instrument groot, per as de weegregel, en een statuschip die de echte
 * fases vertelt (les A17: wachten als verhaal, geen kale spinner). De weging
 * zelf is in v1 een demoweging die het echte instrument het echt laat doen
 * (les A18); zonder API rijdt hij op een tijdlijn in plaats van op de score-
 * engine. Het verdict valt als pushmelding: je uitslag als event, niet als
 * mailtje. Reduced-motion: alles staat direct op de eindstand, melding blijft.
 * Het verdict is de ene donkere sectie (les A8), rood komt er niet aan te pas:
 * een nee is een oordeel, geen fout (les A14). */

/* Demo-tijdlijn: ontvangen -> as 1 -> as 2 -> as 3 -> verdict. */
const STAP_MS = 3200;

export function WegingScreen({ aanvraag }: { aanvraag: Aanvraag | null }) {
  const [fase, setFase] = useState<WegingFase>(bewegingVerminderd() ? 'verdict' : 'ontvangen');
  const [meldingAan, setMeldingAan] = useState(false);
  const meldingAanRef = useRef(false);
  const verdictGemeld = useRef(false);

  /* De tijdlijn loopt een keer, vooruit; terug navigeren reset hem (A12). */
  useEffect(() => {
    if (bewegingVerminderd()) return;
    const timers = FASEN.slice(1).map((f, i) =>
      setTimeout(() => setFase(f.key), (i + 1) * STAP_MS)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  /* Het verdict-moment: haptiek plus pushmelding, precies een keer. */
  useEffect(() => {
    if (fase !== 'verdict' || verdictGemeld.current) return;
    verdictGemeld.current = true;
    voel.succes();
    if (meldingAanRef.current) {
      void verdictMelding(
        `Je verdict is binnen · ${DOSSIER_NR}`,
        `Venture-score ${TOTAAL} van 100, de lat ligt op ${LAT}. ${VERDICT.kop} Open de app voor het hele verhaal.`
      );
    }
  }, [fase]);

  /* Haptische tik per weegmoment: de as klikt aan. */
  const vorigeFase = useRef(fase);
  useEffect(() => {
    if (vorigeFase.current !== fase && fase !== 'verdict' && fase !== 'ontvangen') {
      voel.tik();
    }
    vorigeFase.current = fase;
  }, [fase]);

  const idx = faseIndex(fase);
  const gewogenScore = ASSEN
    .filter((as) => idx > faseIndex(as.id as WegingFase))
    .reduce((som, as) => som + as.gewicht, 0);
  const klaar = fase === 'verdict';

  const zetMelding = async () => {
    const aan = await meldingAanzetten();
    setMeldingAan(aan);
    meldingAanRef.current = aan;
    if (aan) voel.succes();
  };

  return (
    <ScrollView style={s.screen} contentContainerStyle={[s.wrap, { paddingHorizontal: 0 }]}>
      <View style={{ paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Kicker>Mijn weging · dossier {DOSSIER_NR}</Kicker>
            <Statement>
              {aanvraag?.naam ? `${aanvraag.naam}, je aanvraag ligt op tafel.` : 'Je aanvraag ligt op tafel.'}
            </Statement>
          </View>
          <Orb grootte={56} denkt={!klaar} />
        </View>

        {/* De statuschip vertelt de echte fase; de laatste staat is het resultaat. */}
        <View style={{ marginTop: 16 }}>
          <FaseChip tekst={FASEN[idx].chip} actief={!klaar} />
        </View>

        <View style={{ marginTop: 24 }}>
          <Instrument waarde={klaar ? TOTAAL : gewogenScore} />
        </View>

        {!klaar && (
          <Text style={{ fontSize: 13, color: theme.ink62, marginTop: 14, lineHeight: 19 }}>
            Verdict binnen 48 uur. Zet de melding aan en je hoort het op het moment
            dat het valt.
          </Text>
        )}
        {!klaar && (
          meldingAan ? (
            <View style={{ marginTop: 12 }}>
              <FaseChip tekst="melding staat aan · je hoort het verdict" />
            </View>
          ) : (
            <Btn title="Zet melding aan voor het verdict" onPress={zetMelding} style={{ marginTop: 12 }} />
          )
        )}

        {/* Per as de weegregel; elke as klikt aan zodra hij gewogen is. */}
        {ASSEN.map((as, i) => (
          <WeegRegel
            key={as.id}
            label={as.label}
            regel={as.regel}
            gewicht={as.gewicht}
            max={as.max}
            noot={as.noot}
            gewogen={idx > faseIndex(as.id as WegingFase)}
            index={i}
          />
        ))}

        <Text style={{ fontSize: 11.5, color: theme.ink62, marginTop: 14, lineHeight: 17 }}>
          Demoweging zonder score-endpoint: de assen en gewichten zijn samengesteld
          uit echte aanvragen, net als dossier #217 op aiow.ai.
        </Text>
      </View>

      {/* Het verdict: de ene donkere sectie, pas als het er is. */}
      {klaar && (
        <Verschijn index={0}>
          <View style={{
            backgroundColor: theme.verdictBg, marginTop: 26, paddingHorizontal: 20,
            paddingVertical: 30,
          }}>
            <Kicker licht>Het verdict · dossier {DOSSIER_NR}</Kicker>
            <View style={{ marginTop: 18 }}>
              <Instrument waarde={TOTAAL} licht />
            </View>
            <Statement licht groot style={{ marginTop: 22 }}>{VERDICT.kop}</Statement>
            <Text style={{ fontSize: 15, color: theme.verdictInk62, lineHeight: 22, marginTop: 12 }}>
              {VERDICT.tekst}
            </Text>
            <Text style={{
              fontSize: 15.5, color: theme.verdictInk, lineHeight: 23, marginTop: 16, fontWeight: '600',
            }}>
              {VERDICT.draai}
            </Text>
          </View>
        </Verschijn>
      )}
    </ScrollView>
  );
}
