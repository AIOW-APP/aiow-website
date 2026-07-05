/* Brand-switch op build-niveau (Bisnix-regel, zelfde patroon als de
 * Tisnix-app): elke build zonder expliciete productie-vlag is per definitie
 * een TESTversie en heet zichtbaar "AIOW TEST". EAS-productieprofiel zet
 * EXPO_PUBLIC_BRAND=aiow; al het andere is test. Bundle-identifier en slug
 * wijzigen NIET mee (zelfde app in ASC/EAS; certificaat-keten blijft intact). */

const base = require('./app.json');

module.exports = () => {
  const brand = (process.env.EXPO_PUBLIC_BRAND ?? 'test').toLowerCase();
  const isTest = brand !== 'aiow';
  return {
    ...base.expo,
    name: isTest ? 'AIOW TEST' : base.expo.name,
  };
};
