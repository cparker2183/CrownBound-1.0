export const KINGDOM_STANDINGS = [
  { name: "Oathsworn", requiredCrowns: 0 },
  { name: "Retainer", requiredCrowns: 10 },
  { name: "Warden", requiredCrowns: 25 },
  { name: "Banner Knight", requiredCrowns: 50 },
  { name: "High Marshal", requiredCrowns: 100 },
  { name: "Lord Protector", requiredCrowns: 250 },
  { name: "High Steward", requiredCrowns: 500 },
  { name: "Grand Regent", requiredCrowns: 1000 },
  { name: "Royal Regent", requiredCrowns: 2500 },
  { name: "Crownbound", requiredCrowns: 5000 },
];

export function getStandingForCrowns(crowns = 0) {
  const safeCrowns = Number.isFinite(crowns)
    ? Math.max(0, Math.floor(crowns))
    : 0;

  let standing = KINGDOM_STANDINGS[0];

  for (const candidate of KINGDOM_STANDINGS) {
    if (safeCrowns < candidate.requiredCrowns) {
      break;
    }

    standing = candidate;
  }

  return standing;
}