# Documentation PDF generator

This tool generates a single PDF from all Markdown files in `documentation/`.
It uses the same Pandoc-based approach as the internal tooling.

## Requirements (Windows)
- Pandoc
  - `winget install --id=JohnMacFarlane.Pandoc -e`
- MiKTeX or TeX Live
  - `winget install --id=MiKTeX.MiKTeX -e`

## Usage

```powershell
cd C:\Users\rafag\source\repos\rafageist.com
python tools\generate_pdf.py
```

This generates:
`build\documentation-1.0.0.pdf`

## Options

```
--docs-dir PATH      Docs directory (default: documentation)
--out-dir PATH       Output directory (default: build)
--title TITLE        Document title (default: Mentoring Documentation)
--version VERSION    Version string (default: 1.0.0)
--pdf-engine ENGINE  xelatex, pdflatex, lualatex, or auto
--margin MARGIN      Page margin (default: 2.5cm)
```
