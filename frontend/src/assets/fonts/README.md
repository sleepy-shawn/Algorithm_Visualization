# Heading font

`wenkai-headings.ttf` is a Google Fonts text subset of **LXGW WenKai TC Regular**, licensed under SIL OFL 1.1. The complete license and copyright notice are in `OFL-WenKai.txt`.

- Upstream: https://github.com/lxgw/LxgwWenkaiTC
- Distribution: https://github.com/google/fonts/tree/main/ofl/lxgwwenkaitc
- Retrieved: 2026-09-08
- Subset: characters listed in `headings.txt` (57,948 bytes).
- Retrieval endpoint: `https://fonts.googleapis.com/css2?family=LXGW+WenKai+TC&text=…`, with the contents of `headings.txt` URL encoded as `text`; download the font URL returned in that CSS.

The app serves this file from its own assets. No font service is contacted at runtime. `font-display: swap` and local Kai/serif fallbacks keep text visible when loading fails. Body text and controls retain the system sans-serif stack; numerals in the homepage example use system Georgia/Times.

When adding display text, update `headings.txt` and regenerate the subset to avoid mixing fallback glyphs within a heading. Do not apply this limited subset as the body font.
