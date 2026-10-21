import fs from 'fs';
import path from 'path';
import { INDUSTRIAL_PRICE_LIST } from '../src/data/priceListsData.ts';

const targetPath = path.join(process.cwd(), 'data', 'price_items.json');
fs.writeFileSync(targetPath, JSON.stringify(INDUSTRIAL_PRICE_LIST, null, 2), 'utf-8');
console.log(`Successfully synced ${INDUSTRIAL_PRICE_LIST.length} price items to ${targetPath}`);
