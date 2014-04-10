#!/usr/bin/python
# -*- coding=utf-8 -*-

import zipfile
import os.path
import sys

from StringIO import StringIO

from PIL import Image

PATH = """japanese-chess/koma/60x64/"""

mapping = dict(
        OU="sgl11.png",
        HI="sgl02.png",
        KA="sgl03.png",
        KI="sgl04.png",
        GI="sgl05.png",
        KE="sgl06.png",
        KY="sgl07.png",
        FU="sgl08.png",
        RY="sgl22.png",
        UM="sgl23.png",
        NG="sgl25.png",
        NK="sgl26.png",
        TO="sgl27.png",
        NY="sgl28.png",
        ou="sgl31.png",
        hi="sgl32.png",
        ka="sgl33.png",
        ki="sgl34.png",
        gi="sgl35.png",
        ke="sgl36.png",
        ky="sgl37.png",
        fu="sgl38.png",
        ry="sgl51.png",
        um="sgl53.png",
        ng="sgl55.png",
        nk="sgl56.png",
        to="sgl57.png",
        ny="sgl58.png",
)

dest = Image.new('RGBA', (60*len(mapping), 64), (0, 0, 0, 0))
x = 0

js = open('koma.js', 'w')
js.write("""Crafty.sprite("koma.png", {""")

for name, filename in mapping.items():
    path = os.path.join(PATH, filename)
    print path
    with open(path) as src:
        im = Image.open(src)
        js.write("{0}:[{1:d},0,60,64],\n".format(name, x))
        dest.paste(im, (x, 0))
        x += 60

js.write("""});""")
dest.save('koma.png','png')


