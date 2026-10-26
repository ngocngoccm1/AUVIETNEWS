import {cp,readFile,writeFile,rm} from 'node:fs/promises';
// Keep root index.html deployable on GitHub Pages while retaining Vite's source entry.
await rm('assets',{recursive:true,force:true});
await cp('dist/assets','assets',{recursive:true});
await cp('dist/images','images',{recursive:true});
await cp('dist/media','media',{recursive:true});
await cp('dist/favicon.svg','favicon.svg');
await writeFile('index.html',await readFile('dist/index.html','utf8'));
await writeFile('dist/.nojekyll','');
await writeFile('.nojekyll','');
