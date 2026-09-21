const fs = require('fs');
let code = fs.readFileSync('src/pages/CmsPage.tsx', 'utf8');

const imgRegex = /<label className="block font-semibold text-gray-700 mb-1">URL изображения товара \(или локальный путь\)<\/label>\s*<input\s*type="text"\s*value=\{newProdImage\}\s*onChange=\{\(e\) => setNewProdImage\(e\.target\.value\)\}\s*placeholder="https:\/\/\.\.\. или \/images\/products\/my-product\.jpg"\s*className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 font-mono"\s*\/>/g;

const imgReplacement = `<ImageUploadInput label="URL изображения товара (или локальный путь)" value={newProdImage} onChange={setNewProdImage} placeholder="https://... или /images/products/my-product.jpg" />`;
code = code.replace(imgRegex, imgReplacement);

const videoRegex = /<label className="block font-semibold text-gray-700 mb-1">Видео-презентация \(YouTube URL или MP4 ссылка\)<\/label>\s*<input\s*type="text"\s*value=\{newProdVideoUrl\}\s*onChange=\{\(e\) => setNewProdVideoUrl\(e\.target\.value\)\}\s*placeholder="https:\/\/youtube\.com\/watch\?v=\.\.\."\s*className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 font-mono"\s*\/>/g;

const videoReplacement = `<ImageUploadInput label="Видео-презентация (YouTube URL или MP4 ссылка)" value={newProdVideoUrl} onChange={setNewProdVideoUrl} placeholder="https://youtube.com/watch?v=..." />`;
code = code.replace(videoRegex, videoReplacement);

const galleryRegex = /<label className="block font-semibold text-gray-700 mb-1">Дополнительные фото \(Галерея\) - по одной ссылке в строке<\/label>\s*<textarea\s*value=\{newProdGallery\}\s*onChange=\{\(e\) => setNewProdGallery\(e\.target\.value\)\}\s*placeholder="https:\/\/\.\.\."\s*className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 font-mono h-24"\s*\/>/g;
const galleryReplacement = `<label className="block font-semibold text-gray-700 mb-1">Дополнительные фото (Галерея) - по одной ссылке в строке</label>\n<textarea value={newProdGallery} onChange={(e) => setNewProdGallery(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 font-mono h-24 mb-2" />\n<ImageUploadInput label="Загрузить фото для галереи (скопируйте ссылку после загрузки)" value="" onChange={(val) => setNewProdGallery(prev => prev ? prev + '\\n' + val : val)} placeholder="Загрузить файл..." />`;
code = code.replace(galleryRegex, galleryReplacement);

fs.writeFileSync('src/pages/CmsPage.tsx', code);
console.log('Fixed fields part 2');
