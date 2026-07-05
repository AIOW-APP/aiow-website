import React, { useRef, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { theme } from '../theme';
import { voel } from '../voel';
import { PARTNER_FASEN, PARTNER_MOCK, partnerFaseIndex } from '../mock';
import { s, Kicker, Statement, Btn, FaseChip, Kaart, Veld, Verschijn, MonoWaarde } from '../ui';

/* Partner-kanaal, alleen na een ja (report §5): voortgang als fase-chips
 * (les A17), bewijsmomenten als kale bewijsvoering (les A10: het getal is het
 * bewijs, geen dozen eromheen die het verzwakken) en een lijn naar het team.
 * Mock-data: het traject van de planningstool nadat het advies uit het verdict
 * is opgevolgd; een endpoint volgt met het partner-portaal. */

export function PartnerScreen() {
  const [regel, setRegel] = useState('');
  const [toast, setToast] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stuur = () => {
    if (!regel.trim()) {
      voel.waarschuw();
      setToast('Schrijf eerst je regel; het team leest echt mee.');
    } else {
      voel.succes();
      setRegel('');
      setToast('Verstuurd. Het team leest mee en reageert vandaag nog.');
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(''), 3200);
  };

  const idx = partnerFaseIndex(PARTNER_MOCK.fase);

  return (
    <View style={s.screen}>
      <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
        <Kicker>Partner-kanaal · na een ja</Kicker>
        <Statement>Ja gezegd, dus we bouwen. Dit is waar we staan.</Statement>
        <Text style={s.lead}>
          {PARTNER_MOCK.bedrijf} · AIOW bouwt mee voor een omzetdeel van{' '}
          {PARTNER_MOCK.omzetdeel}. Geen uurtjes, gedeeld risico.
        </Text>

        {/* Voortgang: vier fases, de huidige ademt. */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 18 }}>
          {PARTNER_FASEN.map((f, i) => (
            <FaseChip key={f.key} tekst={f.chip} actief={i === idx} />
          ))}
        </View>

        {/* Volgende mijlpaal: stats als kale typografie. */}
        <View style={{ marginTop: 26 }}>
          <Kicker>Volgende bewijsmoment</Kicker>
          <MonoWaarde stijl={{ fontSize: 17, marginTop: 8, lineHeight: 24 }}>
            {PARTNER_MOCK.volgende}
          </MonoWaarde>
        </View>

        <View style={{ marginTop: 26 }}>
          <Kicker>Bewijsmomenten</Kicker>
          {PARTNER_MOCK.bewijs.map((moment, i) => (
            <Verschijn key={moment.datum} index={i}>
              <Kaart>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: theme.ink, flex: 1, marginRight: 10 }}>
                    {moment.titel}
                  </Text>
                  <MonoWaarde stijl={{ fontSize: 12, color: theme.ink62 }}>{moment.datum}</MonoWaarde>
                </View>
                <Text style={{ fontSize: 13.5, color: theme.ink62, lineHeight: 20, marginTop: 6 }}>
                  {moment.detail}
                </Text>
              </Kaart>
            </Verschijn>
          ))}
        </View>

        {/* Een lijn naar het team: geen ticketsysteem, een regel. */}
        <View style={{ marginTop: 26 }}>
          <Kicker>Een lijn naar het team</Kicker>
          <Veld
            label="Wat moet het team weten of regelen?"
            waarde={regel}
            onChange={setRegel}
            meerregelig
            placeholder="Een regel is genoeg"
          />
          <Btn title="Stuur naar het team" onPress={stuur} />
          <Text style={{ fontSize: 11.5, color: theme.ink62, marginTop: 12, lineHeight: 17 }}>
            Demo met voorbeelddata; dit kanaal krijgt een endpoint zodra het
            partner-portaal live is.
          </Text>
        </View>
      </ScrollView>

      {toast ? (
        <View pointerEvents="none" style={{ position: 'absolute', bottom: 34, left: 20, right: 20, alignItems: 'center' }}>
          <View style={{ backgroundColor: theme.ink, borderRadius: 999, paddingHorizontal: 18, paddingVertical: 11 }}>
            <Text style={{ color: theme.bg, fontSize: 12.5, fontWeight: '600' }} numberOfLines={2}>{toast}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}
