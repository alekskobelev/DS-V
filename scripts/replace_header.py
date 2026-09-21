import re

with open('src/components/layout/Header.tsx', 'r') as f:
    content = f.read()

# Replace the initial state for activeHardwareNavTab
content = content.replace("useState<string>('scanline')", "useState<string>('tech-laser')")

# The block to replace is from {/* Left Rail: Categories Tabs */} to {/* Bottom Actions Toolbar */}
start = content.find('{/* Left Rail: Categories Tabs */}')
end = content.find('{/* Bottom Actions Toolbar */}')

new_block = """{/* Left Rail: Categories Tabs */}
                      <div className="w-64 shrink-0 space-y-4 bg-gray-50/70 p-2 rounded-2xl border border-gray-100 overflow-y-auto">
                        {[
                          {
                            groupName: 'ПО ТЕХНОЛОГИИ',
                            items: [
                              {
                                id: 'tech-laser',
                                title: '🔴 Лазерные 3D-сканеры',
                                count: PRODUCTS_DATA.filter(p => p.type === 'hardware' && p.category.includes('scanner') && (p.name.toLowerCase().includes('лазер') || p.name.toLowerCase().includes('freescan') || p.name.toLowerCase().includes('easyscan') || p.name.toLowerCase().includes('hx') || p.name.toLowerCase().includes('as1'))).length,
                                icon: Zap,
                                badgeColor: 'bg-red-50 text-red-700 border-red-200'
                              },
                              {
                                id: 'tech-optical',
                                title: '🔵 Оптические 3D-сканеры (Структурированный свет)',
                                count: PRODUCTS_DATA.filter(p => p.type === 'hardware' && p.category.includes('scanner') && !(p.name.toLowerCase().includes('лазер') || p.name.toLowerCase().includes('freescan') || p.name.toLowerCase().includes('easyscan') || p.name.toLowerCase().includes('hx') || p.name.toLowerCase().includes('as1') || p.name.toLowerCase().includes('инфракрас') || p.name.toLowerCase().includes('einstar') || p.name.toLowerCase().includes('ir'))).length,
                                icon: Scan,
                                badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
                              },
                              {
                                id: 'tech-ir',
                                title: '🟢 Инфракрасные сканеры (IR)',
                                count: PRODUCTS_DATA.filter(p => p.type === 'hardware' && p.category.includes('scanner') && (p.name.toLowerCase().includes('инфракрас') || p.name.toLowerCase().includes('einstar') || p.name.toLowerCase().includes('ir'))).length,
                                icon: Target,
                                badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              },
                              {
                                id: 'tech-cmm',
                                title: '🔵 Стационарные КИМ',
                                count: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.category === 'cmm' || p.category === 'stationary_cmm')).length,
                                icon: Cpu,
                                badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              },
                              {
                                id: 'tech-mobile',
                                title: '🟢 Мобильные КИМ',
                                count: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.category === 'arms' || p.category === 'mobile_cmm')).length,
                                icon: Compass,
                                badgeColor: 'bg-amber-50 text-amber-700 border-amber-200'
                              },
                              {
                                id: 'tech-trackers',
                                title: '🔵 Лазерные трекеры',
                                count: PRODUCTS_DATA.filter(p => p.type === 'hardware' && p.category === 'trackers').length,
                                icon: Target,
                                badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
                              }
                            ]
                          },
                          {
                            groupName: 'ПО БРЕНДАМ',
                            items: [
                              {
                                id: 'brand-scanline',
                                title: 'ScanLine',
                                count: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.brand?.toLowerCase().includes('scanline') || p.id.startsWith('scanline') || p.id.startsWith('eq-scanline'))).length,
                                icon: Box,
                                badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              },
                              {
                                id: 'brand-shining',
                                title: 'Shining 3D',
                                count: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.brand?.toLowerCase().includes('shining') || p.id.startsWith('shining') || p.id.startsWith('freescan') || p.id.startsWith('eq-shining') || p.id.startsWith('eq-freescan'))).length,
                                icon: Sparkles,
                                badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
                              },
                              {
                                id: 'brand-hexagon',
                                title: 'Hexagon / Leica',
                                count: PRODUCTS_DATA.filter(p => p.type === 'hardware' && (p.brand?.toLowerCase().includes('hexagon') || p.brand?.toLowerCase().includes('leica') || p.id.startsWith('hexagon') || p.id.startsWith('primescan') || p.id.startsWith('stereoscan') || p.id.startsWith('smartscan') || p.id.startsWith('eq-hexagon'))).length,
                                icon: Target,
                                badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200'
                              }
                            ]
                          }
                        ].map((group, groupIdx) => (
                          <div key={groupIdx} className="space-y-1">
                            <div className="px-2 text-[10px] font-bold text-gray-400 mb-1">{group.groupName}</div>
                            {group.items.map((cat) => {
                              const IconComp = cat.icon;
                              const isActive = activeHardwareNavTab === cat.id;
                              return (
                                <button
                                  key={cat.id}
                                  onMouseEnter={() => setActiveHardwareNavTab(cat.id)}
                                  onClick={() => setActiveHardwareNavTab(cat.id)}
                                  className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between group ${
                                    isActive 
                                      ? 'bg-white shadow-md border border-blue-200 text-blue-700 font-bold translate-x-1' 
                                      : 'hover:bg-white/80 text-gray-700 font-medium'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-xs truncate">{cat.title}</span>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0 ml-1">
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-semibold border ${cat.badgeColor}`}>
                                      {cat.count}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>

                      {/* Right Panel: Compact Cards of Active Category */}
                      <div className="flex-1 min-w-0 flex flex-col min-h-0">
                        {/* Category Heading Description */}
                        <div className="flex items-center justify-between pb-2 border-b border-gray-100 shrink-0">
                          <div>
                            <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                              {activeHardwareNavTab === 'tech-laser' && '🔴 Лазерные 3D-сканеры'}
                              {activeHardwareNavTab === 'tech-optical' && '🔵 Оптические 3D-сканеры (Структурированный свет)'}
                              {activeHardwareNavTab === 'tech-ir' && '🟢 Инфракрасные сканеры (IR)'}
                              {activeHardwareNavTab === 'tech-cmm' && '🔵 Стационарные КИМ'}
                              {activeHardwareNavTab === 'tech-mobile' && '🟢 Мобильные КИМ'}
                              {activeHardwareNavTab === 'tech-trackers' && '🔵 Лазерные трекеры'}
                              {activeHardwareNavTab === 'brand-scanline' && '🇷🇺 Оборудование ScanLine'}
                              {activeHardwareNavTab === 'brand-shining' && '🇨🇳 Оборудование Shining 3D'}
                              {activeHardwareNavTab === 'brand-hexagon' && '🔷 Оборудование Hexagon / Leica'}
                            </h4>
                            <p className="text-[10px] text-gray-500">
                              {activeHardwareNavTab === 'tech-laser' && 'Высокая точность и стабильность на зеркальных и черных поверхностях, идеально для цеховых условий.'}
                              {activeHardwareNavTab === 'tech-optical' && 'Максимальное разрешение и детализация, безопасный свет, оптимально для сложных геометрий и реверс-инжиниринга.'}
                              {activeHardwareNavTab === 'tech-ir' && 'Безопасное сканирование людей, медицина, VR/AR и сканирование без маркеров.'}
                              {activeHardwareNavTab === 'tech-cmm' && 'Высочайшая метрологическая точность в лабораторных условиях, портальные и мостовые машины.'}
                              {activeHardwareNavTab === 'tech-mobile' && 'Свобода измерений сложных крупногабаритных деталей прямо на производстве.'}
                              {activeHardwareNavTab === 'tech-trackers' && 'Метрологический контроль крупногабаритных объектов до 160 метров.'}
                              {activeHardwareNavTab === 'brand-scanline' && 'Отечественная разработка с гарантией и сервисом в РФ.'}
                              {activeHardwareNavTab === 'brand-shining' && 'Официальные поставки высокоточного оборудования Shining 3D.'}
                              {activeHardwareNavTab === 'brand-hexagon' && 'Премиальные промышленные решения Hexagon Manufacturing Intelligence.'}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setHardwareDropdown(false);
                              handleNav('hardware');
                            }}
                            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 shrink-0 ml-2"
                          >
                            Подробнее в каталоге →
                          </button>
                        </div>

                        {/* Items Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 flex-1 overflow-y-auto pr-1 py-2">
                          {PRODUCTS_DATA.filter((p) => {
                            if (p.type !== 'hardware') return false;
                            
                            const isLaser = p.category.includes('scanner') && (p.name.toLowerCase().includes('лазер') || p.name.toLowerCase().includes('freescan') || p.name.toLowerCase().includes('easyscan') || p.name.toLowerCase().includes('hx') || p.name.toLowerCase().includes('as1'));
                            const isIr = p.category.includes('scanner') && (p.name.toLowerCase().includes('инфракрас') || p.name.toLowerCase().includes('einstar') || p.name.toLowerCase().includes('ir'));
                            const isOptical = p.category.includes('scanner') && !isLaser && !isIr;
                            
                            if (activeHardwareNavTab === 'tech-laser') return isLaser;
                            if (activeHardwareNavTab === 'tech-optical') return isOptical;
                            if (activeHardwareNavTab === 'tech-ir') return isIr;
                            if (activeHardwareNavTab === 'tech-cmm') return p.category === 'cmm' || p.category === 'stationary_cmm';
                            if (activeHardwareNavTab === 'tech-mobile') return p.category === 'arms' || p.category === 'mobile_cmm';
                            if (activeHardwareNavTab === 'tech-trackers') return p.category === 'trackers';
                            
                            if (activeHardwareNavTab === 'brand-scanline') return p.brand?.toLowerCase().includes('scanline') || p.id.startsWith('scanline') || p.id.startsWith('eq-scanline');
                            if (activeHardwareNavTab === 'brand-shining') return p.brand?.toLowerCase().includes('shining') || p.id.startsWith('shining') || p.id.startsWith('freescan') || p.id.startsWith('eq-shining') || p.id.startsWith('eq-freescan');
                            if (activeHardwareNavTab === 'brand-hexagon') return p.brand?.toLowerCase().includes('hexagon') || p.brand?.toLowerCase().includes('leica') || p.id.startsWith('hexagon') || p.id.startsWith('primescan') || p.id.startsWith('stereoscan') || p.id.startsWith('smartscan') || p.id.startsWith('eq-hexagon');
                            
                            return true;
                          }).map((item) => (
                            <button
                              key={item.id}
                              onClick={() => {
                                setHardwareDropdown(false);
                                handleNav('hardware', item.id);
                              }}
                              className="text-left p-2 rounded-xl bg-gray-50/60 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 transition-all group flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                  <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider truncate">{item.brand.split(' ')[0]}</span>
                                  {item.badge && (
                                    <span className="text-[8px] px-1 py-0.2 bg-blue-100 text-blue-800 rounded font-semibold truncate max-w-[90px]">
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                <div className="font-bold text-xs text-gray-900 group-hover:text-blue-600 line-clamp-1 leading-snug">
                                  {item.name}
                                </div>
                                <div className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">
                                  {item.shortDescription}
                                </div>
                              </div>
                              <div className="mt-1 flex items-center justify-end text-[9px] font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span>Перейти к модели →</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      """

content = content[:start] + new_block + content[end:]

with open('src/components/layout/Header.tsx', 'w') as f:
    f.write(content)

