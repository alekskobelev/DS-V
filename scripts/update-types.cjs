const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

// CustomPage
code = code.replace(/export interface CustomPage \{/, "export interface CustomPage {\n  metaTitle?: string;\n  metaDescription?: string;\n  metaKeywords?: string[];");

// ProductItem
code = code.replace(/metaDescription\?: string;\n  keywords\?: string\[\];/g, 'metaTitle?: string;\n  metaDescription?: string;\n  metaKeywords?: string[];\n  keywords?: string[];');

// Article
code = code.replace(/export interface Article \{/, "export interface Article {\n  metaTitle?: string;\n  metaDescription?: string;\n  metaKeywords?: string[];");

// KnowledgeItem
code = code.replace(/export interface KnowledgeItem \{/, "export interface KnowledgeItem {\n  metaTitle?: string;\n  metaDescription?: string;\n  metaKeywords?: string[];");

fs.writeFileSync('src/types.ts', code);
console.log('Types updated');
