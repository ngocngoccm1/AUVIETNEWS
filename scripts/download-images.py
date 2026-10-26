from concurrent.futures import ThreadPoolExecutor
from urllib.request import urlopen, Request
from pathlib import Path
photos={
'berlin':'1560969184-10fe8719e047', 'vietnam':'1528127269322-539801943592',
'saigon':'1583417319070-4a69db38a482', 'energy':'1466611653911-95081537e5b7',
'coffee':'1447933601403-0c6688de566e', 'education':'1523240795612-9a054b0db644',
'community':'1511632765486-a01980e01a18', 'technology':'1518770660439-4636190af475',
'europe':'1464822759023-fed622ff2c3b', 'culture':'1516483638261-f4dbaf036963',
'health':'1576091160399-112ba8d25d1d', 'hanoi':'1509030450996-dd1a26dda07a'}
def get(item):
 name,id=item
 try:
  u=f'https://images.unsplash.com/photo-{id}?auto=format&fit=crop&w=1400&q=82'
  data=urlopen(Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=30).read()
  Path(f'public/images/{name}.jpg').write_bytes(data)
  return name,len(data)
 except Exception as e:return name,str(e)
with ThreadPoolExecutor(max_workers=6) as pool:
 for r in pool.map(get,photos.items()): print(*r)
Path('public/images/credits.json').write_text(__import__('json').dumps({k:f'https://images.unsplash.com/photo-{v}' for k,v in photos.items()},indent=2))
