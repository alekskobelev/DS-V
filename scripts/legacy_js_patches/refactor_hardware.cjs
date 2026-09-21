const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Header.tsx', 'utf-8');

const replacement = `
                        {/* Dynamic hardware categories mapped from PRODUCTS_DATA */}
                        {(() => {
                          const scannerTypes = [
                            { id: 'tech-laser', title: '🔴 Лазерная технология', type: 'laser' },
                            { id: 'tech-optical', title: '🔵 Оптический подсвет', type: 'optical' },
                            { id: 'tech-hybrid', title: '🟣 Гибридная', type: 'hybrid' }
                          ];
                          const brands = ['ScanLine', 'Shining 3D', 'Hexagon / Leica'];
                          
                          // Here we can simplify by replacing the hardcoded groups with a mapped array 
                          // to keep the file shorter, or simply render the nav items using a map.
                          return (
                            <>
                              <div className="space-y-1">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">ПО ТЕХНОЛОГИИ</h4>
                                {scannerTypes.map(t => (
                                  <button
                                    key={t.id}
                                    onMouseEnter={() => setActiveHardwareNavTab(t.id)}
                                    className={\`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors \${activeHardwareNavTab === t.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}\`}
                                  >
                                    <span>{t.title}</span>
                                    <ChevronRight className={\`w-3.5 h-3.5 transition-transform \${activeHardwareNavTab === t.id ? 'translate-x-0.5 text-blue-500' : 'text-transparent'}\`} />
                                  </button>
                                ))}
                              </div>
                            </>
                          )
                        })()}
`;
// Just let's check how long the Header file is now
console.log('Lines:', content.split('\\n').length);
