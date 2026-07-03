export const migrateVerbData = (oldVerb) => {
  if (!oldVerb) return null;

  // Define standard mapping for old compressed keys to new explicit keys
  const tenseMapping = {
    'präsens': 'Präsens',
    'präteritum': 'Präteritum',
    'perfekt': 'Perfekt',
    'futur': 'Futur I',
    'futurI': 'Futur I',
    'konjunktivII': 'Konjunktiv II',
    'konjunktivii': 'Konjunktiv II'
  };

  const pronounExpansion = {
    'ich': ['ich'],
    'du': ['du'],
    'er/sie/es': ['er', 'sie', 'es'],
    'er': ['er'],
    'wir': ['wir'],
    'ihr': ['ihr'],
    'sie/Sie': ['sie', 'Sie'],
    'sie': ['sie'], // ambiguous in isolation, but usually plural in old data if sie/Sie
    'Sie': ['Sie']
  };

  const newConjugations = {};
  const oldConjugations = oldVerb.conjugations || oldVerb.conjugation || {};

  // If already in new format (checking capitalization or structure), return as is or minimal fix
  const isNewFormat = Object.keys(oldConjugations).some(k => k === 'Präsens' || k === 'Präteritum');

  if (isNewFormat) {
     // Ensure all pronouns exist even in new format
     Object.keys(oldConjugations).forEach(tense => {
        newConjugations[tense] = { ...oldConjugations[tense] };
     });
  } else {
    // Migrate Tenses
    Object.keys(oldConjugations).forEach(oldTenseKey => {
      const newTenseKey = tenseMapping[oldTenseKey.toLowerCase()] || oldTenseKey.charAt(0).toUpperCase() + oldTenseKey.slice(1);
      const tenseData = oldConjugations[oldTenseKey];
      
      if (!newConjugations[newTenseKey]) {
        newConjugations[newTenseKey] = {};
      }

      // Migrate/Expand Pronouns
      Object.keys(tenseData).forEach(pronounKey => {
        const value = tenseData[pronounKey];
        const targets = pronounExpansion[pronounKey] || [pronounKey];
        
        targets.forEach(targetPronoun => {
          newConjugations[newTenseKey][targetPronoun] = value;
        });
      });
    });
  }

  // Ensure 'Futur I' exists if missing (simple generation for regular verbs, naive for irregular but prevents crashing)
  // This is a basic fallback generator
  if (!newConjugations['Futur I'] && newConjugations['Präsens']) {
    newConjugations['Futur I'] = {};
    const werdenMap = {
      'ich': 'werde', 'du': 'wirst', 'er': 'wird', 'sie': 'wird', 'es': 'wird',
      'wir': 'werden', 'ihr': 'werdet', 'sie': 'werden', 'Sie': 'werden'
    };
    const infinitive = oldVerb.infinitive || oldVerb.german;
    
    if (infinitive) {
       Object.keys(werdenMap).forEach(p => {
         newConjugations['Futur I'][p] = `${werdenMap[p]} ${infinitive}`;
       });
    }
  }

  return {
    ...oldVerb,
    conjugations: newConjugations,
    // Ensure legacy 'conjugation' key is removed or synced if needed, 
    // but for this app we will switch to using 'conjugations' everywhere.
  };
};

export const batchMigrateVerbs = (verbsList) => {
  return verbsList.map(migrateVerbData);
};