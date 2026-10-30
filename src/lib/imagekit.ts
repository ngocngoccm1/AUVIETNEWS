import uploadedAssets from '../data/imagekit-assets.json';
const endpoint = (import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/noc').replace(/\/$/, '');
export const imageKitFolder = import.meta.env.VITE_IMAGEKIT_FOLDER || '/AU_VIET_NEWS';
/** Only transforms assets belonging to our configured ImageKit endpoint. */
export function imageUrl(source:string|null, width=900) {
 if (!source) return `${import.meta.env.BASE_URL}images/berlin.jpg`;
 if (!source.startsWith(endpoint+'/')) return `${import.meta.env.BASE_URL}images/berlin.jpg`;
 const path=source.slice(endpoint.length+1);
 return `${endpoint}/tr:w-${Math.round(width)},q-85,f-auto/${path}`;
}
export function localImage(source:string|null) {
 const uploadedName = Object.entries(uploadedAssets).find(([,url])=>url===source)?.[0];
 const filename = uploadedName ? `${uploadedName}.jpg` : source?.split('/').pop()?.split('?')[0];
 const available=Object.keys(uploadedAssets).map(name=>`${name}.jpg`);
 return `${import.meta.env.BASE_URL}images/${filename && available.includes(filename) ? filename : 'berlin.jpg'}`;
}
