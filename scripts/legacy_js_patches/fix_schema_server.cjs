const fs = require('fs');
let schema = fs.readFileSync('src/db/schema.ts', 'utf8');

// Fix tickets
schema = schema.replace(
  "equipmentId: integer('equipment_id').references(() => equipmentCatalog.id),",
  "equipmentModel: text('equipment_model'),\n  equipmentId: integer('equipment_id').references(() => equipmentCatalog.id),"
);

// We need to keep rfqSubmissions export alias so server.ts doesn't break
schema = schema + "\nexport const rfqSubmissions = serviceRequests;\n";

fs.writeFileSync('src/db/schema.ts', schema);

let server = fs.readFileSync('server.ts', 'utf8');
// Fix server.ts equipmentModel mapping
server = server.replace(
  "equipmentModel: equipmentModel ? equipmentModel.trim() : null,",
  "equipmentModel: equipmentModel ? equipmentModel.trim() : null,"
);

fs.writeFileSync('server.ts', server);
console.log('Fixed schema compat');
