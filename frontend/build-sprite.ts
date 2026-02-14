import fs from 'fs';
import path from 'path';
import svgSprite from 'svg-sprite';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface SpriteResult {
  symbol: {
    sprite: { contents: string };
    example: { contents: string };
  }
}

// Папка с SVG
const inputDir = path.resolve(__dirname, 'public/icons'); 
// Куда сохранить спрайт
const outputDir = path.resolve(__dirname, 'public/sprite'); 

const config = {
  mode: {
    symbol: { // создаем <symbol> спрайт
      dest: '.',   // куда сохранять (относительно outputDir)
      sprite: 'sprite.svg', // имя спрайта
      example: true,
    },
  },
  shape: {
    id: {
      generator: '%s' // id для каждого symbol
    }
  },
  svg: {
    xmlDeclaration: false,
    doctypeDeclaration: false,
    namespaceIDs: false,
  },
};

const spriter = new svgSprite(config);

// Читаем все SVG файлы
fs.readdirSync(inputDir).forEach((file) => {
  if (file.endsWith('.svg')) {
    const filepath = path.join(inputDir, file);
    const content = fs.readFileSync(filepath, 'utf-8');
    spriter.add(filepath, null, content);
  }
});

// Компилируем спрайт
spriter.compile((error: Error, result: SpriteResult) => {
  if (error) {
    console.error(error);
    process.exit(1);
  }

  // Создаем папку, если не существует
  fs.mkdirSync(outputDir, { recursive: true });

  // Берем результат спрайта
  const spriteContent = result.symbol.sprite.contents;
  fs.writeFileSync(path.join(outputDir, 'sprite.svg'), spriteContent);

   // example.html
  fs.writeFileSync(
    path.join(outputDir, 'symbol.html'),
    result.symbol.example.contents
  );

  console.log('SVG спрайт успешно создан в', outputDir);
});