const fs = require('fs');
let code = fs.readFileSync('src/pages/CmsPage.tsx', 'utf8');

// The original replacement probably failed because of some whitespace difference.
// Let's replace the block entirely.

const imgRegex = /<label className="block font-semibold text-gray-700 mb-1">URL изображения товара \(или локальный путь\)<\/label>\s*<div className="relative flex items-center">\s*<div className="absolute left-3 text-gray-400">\s*<LinkIcon className="w-4 h-4" \/>\s*<\/div>\s*<input\s*type="text"\s*value=\{newProdImage\}\s*onChange=\{\(e\) => setNewProdImage\(e\.target\.value\)\}\s*placeholder="https:\/\/images\.unsplash\.com\/..."\s*className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 font-mono text-sm"\s*\/>\s*<\/div>/g;

const imgReplacement = `<ImageUploadInput label="URL изображения товара (или локальный путь)" value={newProdImage} onChange={setNewProdImage} placeholder="https://images.unsplash.com/..." />`;

code = code.replace(imgRegex, imgReplacement);

const videoRegex = /<label className="block font-semibold text-gray-700 mb-1">Видео-презентация \(YouTube URL или MP4 ссылка\)<\/label>\s*<div className="relative flex items-center">\s*<div className="absolute left-3 text-gray-400">\s*<LinkIcon className="w-4 h-4" \/>\s*<\/div>\s*<input\s*type="text"\s*value=\{newProdVideoUrl\}\s*onChange=\{\(e\) => setNewProdVideoUrl\(e\.target\.value\)\}\s*placeholder="https:\/\/youtube\.com\/watch\?v=..."\s*className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 font-mono text-sm"\s*\/>\s*<\/div>/g;

const videoReplacement = `<ImageUploadInput label="Видео-презентация (YouTube URL или MP4 ссылка)" value={newProdVideoUrl} onChange={setNewProdVideoUrl} placeholder="https://youtube.com/watch?v=..." />`;

code = code.replace(videoRegex, videoReplacement);

fs.writeFileSync('src/pages/CmsPage.tsx', code);
console.log('Fixed ImageUploadInput for Image and Video');
