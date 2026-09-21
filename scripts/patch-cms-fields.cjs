const fs = require('fs');
let code = fs.readFileSync('src/pages/CmsPage.tsx', 'utf8');

// Replace Image input
const imgRegex = /<label className="block font-semibold text-gray-700 mb-1">URL изображения товара \(или локальный путь\)<\/label>\s*<input\s*type="text"\s*value=\{newProdImage\}\s*onChange=\{\(e\) => setNewProdImage\(e\.target\.value\)\}\s*placeholder="https:\/\/images\.unsplash\.com\/..."\s*className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 font-mono"\s*\/>/g;
const imgReplacement = `<ImageUploadInput label="URL изображения товара (или локальный путь)" value={newProdImage} onChange={setNewProdImage} placeholder="https://images.unsplash.com/..." />`;
code = code.replace(imgRegex, imgReplacement);

// Replace Gallery input
const galleryRegex = /<label className="block font-semibold text-gray-700 mb-1">Дополнительные фото \(Галерея\) - по одной ссылке в строке<\/label>\s*<textarea\s*rows=\{3\}\s*value=\{newProdGallery\}\s*onChange=\{\(e\) => setNewProdGallery\(e\.target\.value\)\}\s*className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 font-mono text-sm"\s*\/>/g;
const galleryReplacement = `<ImageUploadInput label="Дополнительные фото (Галерея) - по одной ссылке в строке" value={newProdGallery} onChange={setNewProdGallery} placeholder="https://..." multiline={true} className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 font-mono text-sm" />`;
code = code.replace(galleryRegex, galleryReplacement);

// Replace Video input
const videoRegex = /<label className="block font-semibold text-gray-700 mb-1">Видео-презентация \(YouTube URL или MP4 ссылка\)<\/label>\s*<input\s*type="text"\s*value=\{newProdVideoUrl\}\s*onChange=\{\(e\) => setNewProdVideoUrl\(e\.target\.value\)\}\s*placeholder="https:\/\/www\.youtube\.com\/watch\?v=..."\s*className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 font-mono"\s*\/>/g;
const videoReplacement = `<ImageUploadInput label="Видео-презентация (YouTube URL или MP4 ссылка)" value={newProdVideoUrl} onChange={setNewProdVideoUrl} placeholder="https://www.youtube.com/watch?v=..." />`;
code = code.replace(videoRegex, videoReplacement);

// Replace Brochure input
const brochureRegex = /<label className="block font-semibold text-gray-700 mb-1">Ссылка на загруженную брошюру \(PDF \/ Облако\)<\/label>\s*<input\s*type="text"\s*value=\{newProdBrochureUrl\}\s*onChange=\{\(e\) => setNewProdBrochureUrl\(e\.target\.value\)\}\s*placeholder="https:\/\/yandex\.ru\/disk\/i\/\.\.\. или https:\/\/storage\.\.\.\/brochure\.pdf"\s*className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 font-mono"\s*\/>/g;
const brochureReplacement = `<ImageUploadInput label="Ссылка на загруженную брошюру (PDF / Облако)" value={newProdBrochureUrl} onChange={setNewProdBrochureUrl} placeholder="https://yandex.ru/disk/i/... или https://storage.../brochure.pdf" />`;
code = code.replace(brochureRegex, brochureReplacement);

// Replace Product Features Textarea with RichTextEditor
const prodFeaturesRegex = /<label className="block font-semibold text-gray-700 mb-1">\s*Ключевые преимущества и функции \(по 1 в строке\)\s*<\/label>\s*<textarea\s*rows=\{3\}\s*value=\{newProdFeatures\}\s*onChange=\{\(e\) => setNewProdFeatures\(e\.target\.value\)\}\s*placeholder="Автоматическое разделение матрица\/пуансон\&\#10;Библиотеки стандартных пакетов Hasco, DME\&\#10;Прямая интеграция с PDM"\s*className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"\s*\/>/g;
const prodFeaturesReplacement = `<label className="block font-semibold text-gray-700 mb-1">Ключевые преимущества и функции</label>
<div className="border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
  <RichTextEditor
    content={newProdFeatures}
    onChange={setNewProdFeatures}
    placeholder="<p>Перечислите ключевые преимущества, используйте списки...</p>"
  />
</div>`;
code = code.replace(prodFeaturesRegex, prodFeaturesReplacement);

// Replace Service Benefits Textarea with RichTextEditor
const servBenefitsRegex = /<label className="block font-semibold text-gray-700 mb-1">Преимущества услуги \(по 1 в строке\)<\/label>\s*<textarea\s*rows=\{2\}\s*value=\{servBenefits\}\s*onChange=\{\(e\) => setServBenefits\(e\.target\.value\)\}\s*placeholder="Выезд с мобильным сканером по всей РФ\&\#10;Точность до 0\.015 мм\&\#10;Официальный метрологический отчет"\s*className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"\s*\/>/g;
const servBenefitsReplacement = `<label className="block font-semibold text-gray-700 mb-1">Преимущества услуги</label>
<div className="border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
  <RichTextEditor
    content={servBenefits}
    onChange={setServBenefits}
    placeholder="<p>Опишите преимущества, используйте списки...</p>"
  />
</div>`;
code = code.replace(servBenefitsRegex, servBenefitsReplacement);


fs.writeFileSync('src/pages/CmsPage.tsx', code);
console.log('Patched fields in CmsPage.tsx');
