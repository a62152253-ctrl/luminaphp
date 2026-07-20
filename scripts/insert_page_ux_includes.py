from pathlib import Path

pages_dir = Path('pages')
include_snippet = "<?php require_once __DIR__ . '/../includes/page-ux-enhancer.php'; ?>\n"

for path in sorted(pages_dir.glob('*.php')):
    text = path.read_text(encoding='utf-8')
    if 'page-ux-enhancer.php' in text:
        continue
    path.write_text(text.rstrip() + "\n\n" + include_snippet, encoding='utf-8')

print('Inserted UX include into page files.')
