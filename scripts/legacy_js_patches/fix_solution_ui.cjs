const fs = require('fs');

let content = fs.readFileSync('src/components/home/SolutionMatcher.tsx', 'utf8');

const target = `            </div>
            {/* Action Bar */}`;

const replacement = `            </div>
            
            {/* Services and Payback */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 flex items-start gap-3">
                <Wrench className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h6 className="text-[11px] font-bold uppercase tracking-wider text-blue-800">Сопутствующие услуги</h6>
                  <p className="text-sm font-semibold text-blue-950 mt-1">{solution.serviceSupport}</p>
                </div>
              </div>
              <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-100 flex items-start gap-3">
                <Clock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h6 className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Окупаемость комплекса</h6>
                  <p className="text-sm font-semibold text-emerald-950 mt-1">{solution.estimatedPayback}</p>
                </div>
              </div>
            </div>

            {/* Action Bar */}`;

content = content.replace(target, replacement);

fs.writeFileSync('src/components/home/SolutionMatcher.tsx', content);
console.log('Fixed UI in SolutionMatcher.tsx');
