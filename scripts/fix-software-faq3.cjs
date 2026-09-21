const fs = require('fs');
let content = fs.readFileSync('src/pages/SoftwarePage.tsx', 'utf8');

const regex = /\{\/\* FAQ Section at the bottom of Software Page \*\/\}\s*<div className="pt-8 mt-4 border-t border-gray-200">[\s\S]*?<\/div>\s*<\/div>\s*\);\s*};/g;

const replacement = `      {/* FAQ Section at the bottom of Software Page */}
      {(detailProduct || filterCat !== 'all') && (
        <div className="pt-8 mt-4 border-t border-gray-200">
          {detailProduct ? (
            <ProductFaqSection 
              product={detailProduct}
              title={\`Часто задаваемые вопросы: \${detailProduct.name}\`}
              subtitle="Ответы ведущих инженеров ДС-Инжиниринг на технические вопросы по внедрению, совместимости и расчетным алгоритмам"
            />
          ) : (
            <ProductFaqSection 
              faqs={
                filtered.flatMap(p => p.faq || [])
              }
              title={
                filterCat === 'topsolid' ? 'TopSolid 7: Часто задаваемые вопросы' :
                filterCat === 'polyworks' ? 'PolyWorks: Часто задаваемые вопросы' :
                filterCat === 'geomagic' ? 'Geomagic: Часто задаваемые вопросы' : 'ПО Shining 3D: Часто задаваемые вопросы'
              }
              subtitle="Экспертные разъяснения инженеров ДС-Инжиниринг"
            />
          )}
        </div>
      )}
    </div>
  );
};`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/pages/SoftwarePage.tsx', content);
  console.log("FAQ replaced successfully");
} else {
  console.log("Regex didn't match!");
}
