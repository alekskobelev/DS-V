import { PRODUCTS_DATA } from '../src/data/mockData';

const isLaser = (p: any) => {
  const text = (p.name + ' ' + (p.fullDescription || '') + ' ' + (p.shortDescription || '') + ' ' + (p.features?.join(' ') || '')).toLowerCase();
  return text.includes('лазер') || text.includes('freescan') || text.includes('easyscan') || text.includes('hx') || text.includes('as1') || text.includes('laser');
};

const isIR = (p: any) => {
  const text = (p.name + ' ' + (p.fullDescription || '') + ' ' + (p.shortDescription || '') + ' ' + (p.features?.join(' ') || '')).toLowerCase();
  return text.includes('инфракрас') || text.includes('einstar') || text.includes('vcsel') || text.includes('combo') || p.name.toLowerCase().includes('einscan h');
};

const isOptical = (p: any) => {
  const text = (p.name + ' ' + (p.fullDescription || '') + ' ' + (p.shortDescription || '') + ' ' + (p.features?.join(' ') || '')).toLowerCase();
  const hasOpticalKeywords = text.includes('оптическ') || text.includes('структурированн') || text.includes('led') || text.includes('свет') || text.includes('einscan') || text.includes('transcan') || text.includes('primescan') || text.includes('smartscan') || text.includes('stereoscan') || text.includes('scanline');
  return hasOpticalKeywords || (!isLaser(p) && !isIR(p)); // If it's a scanner but not laser/IR, it must be optical
};

const hardwareProducts = PRODUCTS_DATA.filter(p => p.type === 'hardware' && p.category.includes('scanner'));

console.log("--- LASER ---");
hardwareProducts.filter(isLaser).forEach(p => console.log(p.name));

console.log("\n--- IR ---");
hardwareProducts.filter(isIR).forEach(p => console.log(p.name));

console.log("\n--- OPTICAL ---");
hardwareProducts.filter(isOptical).forEach(p => console.log(p.name));

console.log("\n--- HYBRIDS (Multiple) ---");
hardwareProducts.filter(p => [isLaser(p), isIR(p), isOptical(p)].filter(Boolean).length > 1).forEach(p => console.log(p.name));

