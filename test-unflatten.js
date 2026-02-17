// Test script to verify unflatten logic
const unflattenTranslations = (flatData) => {
  if (!flatData || Object.keys(flatData).length === 0) {
    return {};
  }
  
  const result = {};
  
  for (const [key, value] of Object.entries(flatData)) {
    const parts = key.split('.');
    let current = result;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current)) {
        current[part] = {};
      }
      current = current[part];
    }
    
    current[parts[parts.length - 1]] = value;
  }
  
  return result;
};

// Test with sample data that would come from Sanity
const sampleFlatData = {
  'products.organicTomatoes.title': 'Organic Tomatoes',
  'products.organicTomatoes.description': 'Fresh, locally grown organic tomatoes',
  'products.freshStrawberries.title': 'Fresh Strawberries',
  'products.freshStrawberries.description': 'Sweet Norwegian strawberries',
  'categories.vegetables': 'Vegetables',
  'categories.fruits': 'Fruits',
  'locations.oslo': 'Oslo',
  'locations.bergen': 'Bergen'
};

const unflattened = unflattenTranslations(sampleFlatData);

console.log('Flattened input:', JSON.stringify(sampleFlatData, null, 2));
console.log('\nUnflattened output:', JSON.stringify(unflattened, null, 2));
console.log('\nAccess test - products.organicTomatoes.title:', unflattened.products?.organicTomatoes?.title);
