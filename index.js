#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const program = require('commander');
const colors = require('colors');
const mkdirp = require('mkdirp');

let blockName;
let exts;

program
  .version('1.0.0')
  .usage('<name> [extensions]')
  .arguments('<cmd> [ext...]')
  .action((cmd, env) => {
    blockName = cmd;
    exts = env;
  });

program.on('--help', () => {
  console.log('');
  console.log('Examples:');
  console.log('');
  console.log('  $ blocks example       # create "example" block with default extensions');
  console.log('  $ blocks example js    # create "example" block with default & given extensions');
});

program.parse(process.argv);

// Error when no name of block
if (typeof blockName === 'undefined') {
  console.error(colors.red('Не задано имя блока'));
  console.log('');
  program.help();
}

// De duplicate array
function uniqueArray(arr) {
  const objectTemp = {};
  for (let i = 0; i < arr.length; i++) {
    const str = arr[i];
    objectTemp[str] = true; // запомнить строку в виде свойства объекта
  }
  return Object.keys(objectTemp);
}

const configPath = path.join(process.cwd(), 'config.json');
const config = require(configPath);
// const dirs = config.dirs;
const { dirs } = config;
const defaultExtensions = ['pcss', 'pug', 'img', 'bg-img'];
const extensions = uniqueArray(defaultExtensions.concat(exts));
const dirPath = `${dirs.srcPath + dirs.blocksDirName}/${blockName}/`;

mkdirp(dirPath, (err) => {
  if (err) {
    console.error(colors.red(`Ошибка: ${err}`));
  } else {
    console.log(`Создание папки ${dirPath} (если отсутствует)`);

    extensions.forEach((extension) => {
      const filePath = `${dirPath + blockName}.${extension}`;
      let fileContent = '';
      const fileCreateMsg = '';

      if (extension === 'pcss') {
        fileContent = `.${blockName} {\n  \n}`;
      } else if (extension === 'html') {
        fileContent = `<div class="${blockName}">content</div>\n`;
      } else if (extension === 'js') {
        fileContent = '// document.addEventListener(\'DOMContentLoaded\', function(){});\n// (function(){\n// код\n// }());\n';
      } else if (extension === 'pug') {
        fileContent = `//- Все примеси в этом файле должны начинаться c имени блока (${blockName})\n\nmixin ${blockName}(text, mods)\n\n  //- Принимает:\n  //-   text    {string} - текст\n  //-   mods    {string} - список модификаторов\n  //- Вызов:\n        +${blockName}('Текст', 'some-mod')\n\n  -\n    // список модификаторов\n    var allMods = '';\n    if(typeof(mods) !== 'undefined' && mods) {\n      var modsList = mods.split(',');\n      for (var i = 0; i < modsList.length; i++) {\n        allMods = allMods + ' ${blockName}-' + modsList[i].trim();\n      }\n    }\n\n  .${blockName}(class=allMods)&attributes(attributes)\n    .${blockName}__inner!= text\n`;
      } else if (extension === 'img') {
        const imgFolder = `${dirPath}img/`;
        if (fs.existsSync(imgFolder) === false) {
          mkdirp(imgFolder, (err) => {
            if (err) console.error(err);
            else console.log(`Создание папки: ${imgFolder} (если отсутствует)`);
          });
        } else {
          console.log(`Папка ${imgFolder} НЕ создана (уже существует) `);
        }
      } else if (extension === 'bg-img') {
        const imgFolder = `${dirPath}bg-img/`;
        if (fs.existsSync(imgFolder) === false) {
          mkdirp(imgFolder, (err) => {
            if (err) console.error(err);
            else console.log(`Создание папки: ${imgFolder} (если отсутствует)`);
          });
        } else {
          console.log(`Папка ${imgFolder} НЕ создана (уже существует) `);
        }
      }

      if (fs.existsSync(filePath) === false && extension !== 'img' && extension !== 'bg-img') {
        fs.writeFile(filePath, fileContent, (err) => {
          if (err) {
            return console.log(`Файл НЕ создан: ${err}`);
          }
          console.log(`Файл создан: ${filePath}`);
          if (fileCreateMsg) {
            console.warn(fileCreateMsg);
          }
        });
      } else if (extension !== 'img' && extension !== 'bg-img') {
        console.log(`Файл НЕ создан: ${filePath} (уже существует)`);
      }
    });

    let hasThisBlock = false;
    for (const block in config.blocks) {
      if (block === blockName) {
        hasThisBlock = true;
        break;
      }
    }
    if (!hasThisBlock) {
      config.blocks[blockName] = [];
      const newConfig = JSON.stringify(config, '', 2);
      fs.writeFileSync(configPath, newConfig);
      console.log('Подключение блока добавлено в config.json');
    }
  }
});
