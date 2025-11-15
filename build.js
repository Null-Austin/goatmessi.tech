const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const chokidar = require('chokidar');
const sass = require('sass');
const { minify } = require('html-minifier-terser');

function randomFile(ext) {
  return crypto.randomBytes(8).toString('hex') + ext;
}

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function build() {
  const project = __dirname;
  const docs = path.join(project, 'docs');
  const temp = path.join(project, 'temp');
  const htmlDir = path.join(project, 'html');
  const jsDir = path.join(project, 'js');
  const scssDir = path.join(project, 'scss');
  const imagesSrc = path.join(project, 'images');
  const rawDir = path.join(project, 'rawdir');

  console.log('Starting build...');

  // Clean docs
  await fs.rm(docs, { recursive: true, force: true });
  await fs.mkdir(docs, { recursive: true });

  // Copy rawdir files
  try {
    await copyDir(rawDir, docs);
    console.log('Rawdir files copied.');
  } catch (err) {
    console.log('No rawdir to copy, skipping.');
  }

  // Compile SASS
  let cssContent = '';
  try {
    const scssFiles = await fs.readdir(scssDir);
    for (const file of scssFiles) {
      if (file.endsWith('.scss')) {
        const result = sass.compile(path.join(scssDir, file), { style: 'compressed' });
        cssContent += result.css + '\n';
      }
    }
  } catch (err) {
    console.log('No SCSS files found, skipping SASS compile.');
  }

  // Combine JS
  let jsContent = '';
  try {
    const jsFiles = await fs.readdir(jsDir);
    for (const file of jsFiles) {
      if (file.endsWith('.js')) {
        jsContent += await fs.readFile(path.join(jsDir, file), 'utf8') + '\n';
      }
    }
  } catch (err) {
    console.log('No JS files found, skipping JS combine.');
  }

  // Process HTML
  try {
    const htmlFiles = await fs.readdir(htmlDir);
    for (const file of htmlFiles) {
      if (file.endsWith('.html')) {
        let html = await fs.readFile(path.join(htmlDir, file), 'utf8');
        html = html.replace(/<link rel="stylesheet" href="[^"]*">/g, `<style>${cssContent}</style>`)
                   .replace(/<script src="[^"]*"><\/script>/g, `<script>${jsContent}</script>`);

        // Randomize images if images exist
        try {
          const imgFolder = randomFile('');
          const imgDest = path.join(docs, imgFolder);
          await fs.mkdir(imgDest);
          const imgs = await fs.readdir(imagesSrc);
          const map = {};
          for (const img of imgs) {
            const ext = path.extname(img);
            const newName = randomFile(ext);
            await fs.copyFile(path.join(imagesSrc, img), path.join(imgDest, newName));
            map[`images/${img}`] = `${imgFolder}/${newName}`;
          }
          for (const oldPath in map) html = html.replaceAll(oldPath, map[oldPath]);
        } catch { }

        const minified = await minify(html, {
          collapseWhitespace: true,
          removeComments: true,
          minifyCSS: true,
          minifyJS: true,
          minifyURLs: true,
          useShortDoctype: true
        });

        await fs.writeFile(path.join(docs, file), minified);
      }
    }
  } catch { 
    console.log('No HTML files found, skipping HTML processing.');
  }

  console.log('Build complete.');
}

async function watch() {
  const watcher = chokidar.watch(['scss', 'js', 'html'], { ignoreInitial: true });
  watcher.on('all', async () => {
    console.log('Changes detected, rebuilding...');
    await build();
  });
  console.log('Watching for changes...');
}

const args = process.argv.slice(2);
if (args.includes('--build')) build();
if (args.includes('--watch')) watch();
