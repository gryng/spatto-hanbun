"""Artifact 用の本体（<head> なし）から、GitHub Pages 用の index.html を組み立てる。

  python3 build.py <artifact版のhtml> [RANK_URL]
"""
import sys, re
src = open(sys.argv[1], encoding='utf-8').read()
url = sys.argv[2] if len(sys.argv) > 2 else None
if url:
    assert src.count("const RANK_URL = '';") == 1
    src = src.replace("const RANK_URL = '';", f"const RANK_URL = '{url}';")
cut = src.index('</style>') + len('</style>')
head, body = src[:cut], src[cut:]
desc = '投げ上げられた◯をスワイプで斬って、だいたい半分なら成功。切り口を小数点まで計測する精密スライスゲーム。'
out = f'''<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="{desc}">
<meta property="og:title" content="スパッと半分">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="website">
<meta name="theme-color" content="#0F1830">
<style>
:root{{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}}
*,*::before,*::after{{box-sizing:border-box}}
body{{margin:0;font-size:14px;-webkit-text-size-adjust:100%}}
img{{max-width:100%}}
</style>
{head.strip()}
</head>
<body>
{body.strip()}
</body>
</html>
'''
open('index.html', 'w', encoding='utf-8').write(out)
print('built index.html', 'with RANK_URL' if url else '(ranking hidden)')
