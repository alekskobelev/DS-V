const fs = require('fs');
let content = fs.readFileSync('src/pages/SoftwarePage.tsx', 'utf8');

const oldFaq = `      {/* FAQ Section at the bottom of Software Page */}
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
            title={filterCat === 'all' ? 'База знаний: Программное обеспечение' : 'Часто задаваемые вопросы'}
            subtitle="Ответы на технические вопросы от наших инженеров"
          />
        )}
      </div>`;

const newFaq = `      {/* FAQ Section at the bottom of Software Page */}
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
              title='Часто задаваемые вопросы'
              subtitle="Ответы на технические вопросы от наших инженеров"
            />
          )}
        </div>
      )}`;

if(content.includes(oldFaq)) {
    content = content.replace(oldFaq, newFaq);
    fs.writeFileSync('src/pages/SoftwarePage.tsx', content);
    console.log("FAQ condition updated exactly.");
} else {
    console.log("oldFaq not found! Will try a regex replacement.");
    // Let's just replace the div block 
    const fallbackRegex = /\{\/\* FAQ Section at the bottom of Software Page \*\/\}\s*<div className="pt-8 mt-4 border-t border-gray-200">[\s\S]*?<\/div>\s*<\/div>\s*<\/Layout>/;
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
              title='Часто задаваемые вопросы'
              subtitle="Ответы на технические вопросы от наших инженеров"
            />
          )}
        </div>
      )}
    </div>
  </Layout>`;
    content = content.replace(fallbackRegex, replacement);
    fs.writeFileSync('src/pages/SoftwarePage.tsx', content);
    console.log("FAQ replaced using regex.");
}
