sed -i 's/label: '\''Shining 3D (EXModel \/ Inspect)'\''/label: '\''Shining 3D (FreeScan \/ EXModel \/ Inspect)'\''/g' src/pages/SoftwarePage.tsx
sed -i 's/defaultProduct: '\''Shining 3D EXModel \/ Inspect'\''/defaultProduct: '\''Shining 3D FreeScan \/ EXModel \/ Inspect'\''/g' src/pages/SoftwarePage.tsx
sed -i 's/Shining 3D (EXModel \/ Inspect)/Shining 3D (FreeScan \/ EXModel \/ Inspect)/g' src/utils/seo.ts
sed -i 's/name: '\''FreeScan'\''/name: '\''Shining 3D FreeScan'\''/g' src/data/mockData.ts
sed -i 's/<h4 className="text-xl font-bold text-white">FreeScan<\/h4>/<h4 className="text-xl font-bold text-white">Shining 3D FreeScan<\/h4>/g' src/pages/SoftwarePage.tsx
