"""Rebuild the local editorial sample montage with ffmpeg (optional)."""
from pathlib import Path
import subprocess, sys, tempfile
ffmpeg=sys.argv[1] if len(sys.argv)>1 else 'ffmpeg'
shots=[('berlin','NHỮNG NHỊP CẦU VIỆT – ÂU'),('vietnam','GÌN GIỮ NHỮNG GIÁ TRỊ'),('saigon','KẾT NỐI NHỮNG CƠ HỘI'),('culture','LẮNG NGHE NHỮNG CÂU CHUYỆN'),('energy','CÙNG VIẾT TƯƠNG LAI XANH'),('community','NHÂN VĂN – KẾT NỐI – SẺ CHIA')]
Path('public/media').mkdir(exist_ok=True)
with tempfile.TemporaryDirectory(prefix='viet-au-video-') as work:
 parts=[]
 for i,(image,caption) in enumerate(shots):
  subtitles=Path(work)/f'title-{i}.ass'
  subtitles.write_text(f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1280
PlayResY: 720
[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Brand,DejaVu Sans,15,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,0,0,7,52,52,52,1
Style: Title,DejaVu Serif,29,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,0,0,7,52,52,52,1
[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:00.00,0:00:03.00,Brand,,0,0,0,,{{\\pos(52,565)}}THỜI BÁO VIỆT - ÂU  /  NỘI DUNG MINH HỌA
Dialogue: 0,0:00:00.00,0:00:03.00,Title,,0,0,0,,{{\\pos(52,610)}}{caption}
""")
  target=str(Path(work)/f'{i}.mp4');parts.append(target)
  vf=f"scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,setsar=1,drawbox=x=0:y=525:w=1280:h=195:color=black@0.45:t=fill,ass={subtitles},fade=t=in:st=0:d=0.4,fade=t=out:st=2.6:d=0.4"
  subprocess.run([ffmpeg,'-loglevel','error','-y','-loop','1','-i',f'public/images/{image}.jpg','-t','3','-vf',vf,'-r','25','-c:v','libx264','-preset','fast','-crf','24','-pix_fmt','yuv420p',target],check=True)
 listing=Path(work)/'concat.txt';listing.write_text('\n'.join(f"file '{p}'" for p in parts))
 subprocess.run([ffmpeg,'-loglevel','error','-y','-f','concat','-safe','0','-i',str(listing),'-c','copy','-movflags','+faststart','public/media/viet-au-visual.mp4'],check=True)
print('Created public/media/viet-au-visual.mp4')
