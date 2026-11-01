"""Generate Plazza's original capsule/fast-delivery launcher mark.

Drawn from geometry at high resolution, so no external logo or screenshot is
embedded. Foreground content stays in Android's adaptive-icon safe area.
"""
from pathlib import Path
from PIL import Image, ImageDraw

SIZE = 1024
SCALE = 3
PINK = '#FF0099'
PURPLE = '#2E115D'
OUT = Path(__file__).resolve().parents[1] / 'assets'

def mark(monochrome=False):
    canvas = Image.new('RGBA', (SIZE*SCALE, SIZE*SCALE))
    pill = Image.new('RGBA', (600*SCALE, 300*SCALE))
    draw = ImageDraw.Draw(pill)
    draw.rounded_rectangle((0, 0, 599*SCALE, 299*SCALE), radius=150*SCALE, fill='white')
    if not monochrome:
        # A purple half visually separates the capsule while the white lightning
        # in the seam reinforces delivery speed at small launcher sizes.
        half = Image.new('RGBA', pill.size)
        ImageDraw.Draw(half).rectangle((300*SCALE, 0, 600*SCALE, 300*SCALE), fill=PURPLE)
        half.putalpha(Image.composite(pill.getchannel('A'), Image.new('L',pill.size), half.getchannel('A')))
        pill = Image.alpha_composite(pill, half)
    draw = ImageDraw.Draw(pill)
    bolt = [(320,40),(250,163),(302,163),(280,265),(378,128),(321,128),(350,40)]
    draw.polygon([(x*SCALE,y*SCALE) for x,y in bolt], fill=(0,0,0,0) if monochrome else PINK)
    pill = pill.rotate(38, resample=Image.Resampling.BICUBIC, expand=True)
    # Fit inside ~60% of the canvas for adaptive mask safety.
    pill.thumbnail((590*SCALE,590*SCALE), Image.Resampling.LANCZOS)
    canvas.alpha_composite(pill, ((SIZE*SCALE-pill.width)//2,(SIZE*SCALE-pill.height)//2))
    return canvas.resize((SIZE,SIZE),Image.Resampling.LANCZOS)

foreground=mark()
foreground.save(OUT/'plazza-adaptive-foreground.png')
mark(True).save(OUT/'plazza-monochrome.png')
background=Image.new('RGBA',(SIZE,SIZE),PINK)
Image.alpha_composite(background,foreground).convert('RGB').save(OUT/'plazza-icon.png')
foreground.save(OUT/'plazza-splash.png')
Image.alpha_composite(background,foreground).resize((64,64),Image.Resampling.LANCZOS).save(OUT/'plazza-favicon.png')
print('Created launcher, adaptive, themed, splash and favicon assets.')
