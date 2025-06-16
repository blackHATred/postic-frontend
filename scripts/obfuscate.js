// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import JavaScriptObfuscator from 'javascript-obfuscator';
import * as globModule from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const obfuscatorConfig = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../obfuscator.config.json'), 'utf8'),
);

const jsFiles = globModule.glob.sync('build/static/js/main.*.js');

if (jsFiles.length === 0) {
  console.error('JS файлы не найдены в директории build/static/js!');
  // eslint-disable-next-line no-undef
  process.exit(1);
}

jsFiles.forEach((filePath) => {
  console.log(`Обфускация файла: ${filePath}`);
  const code = fs.readFileSync(filePath, 'utf8');

  try {
    const obfuscationResult = JavaScriptObfuscator.obfuscate(code, obfuscatorConfig);

    fs.writeFileSync(filePath, obfuscationResult.getObfuscatedCode());
    console.log(`Обфускация успешно завершена: ${filePath}`);
  } catch (error) {
    console.error(`Ошибка при обфускации ${filePath}:`, error);
    // eslint-disable-next-line no-undef
    process.exit(1);
  }
});

console.log('Обфускация всех файлов успешно завершена!');
