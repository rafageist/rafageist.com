#!/usr/bin/env python3
"""
Generate a single combined PDF from all Markdown files in /documentation.

This tool uses Pandoc to create a PDF document with:
- Table of contents
- Page numbers
- Section numbering
- A simple cover page

Requirements:
- pandoc
- MiKTeX or TeX Live (for PDF generation)
"""

import argparse
import os
import subprocess
from datetime import datetime
from pathlib import Path
from typing import List, Optional


def check_pandoc() -> bool:
    """Check if pandoc is installed."""
    try:
        result = subprocess.run(
            ["pandoc", "--version"],
            capture_output=True,
            text=True,
            check=False
        )
        return result.returncode == 0
    except FileNotFoundError:
        return False


def find_available_pdf_engine() -> Optional[str]:
    """Find the first available PDF engine."""
    engines = ["pdflatex", "xelatex", "lualatex"]
    for engine in engines:
        try:
            result = subprocess.run(
                [engine, "--version"],
                capture_output=True,
                text=True,
                check=False
            )
            if result.returncode == 0:
                return engine
        except FileNotFoundError:
            continue
    return None


def create_cover_page(output_path: Path, title: str, version: str, date: str) -> None:
    """Create a YAML front matter cover page."""
    cover_content = f"""---
title: "{title}"
subtitle: "Version {version}"
date: "{date}"
---

\\newpage
"""
    output_path.write_text(cover_content, encoding="utf-8")


def combine_markdown_files(md_files: List[Path], combined_path: Path) -> None:
    """Combine all markdown files into a single file."""
    with combined_path.open("w", encoding="utf-8") as outfile:
        for md_file in md_files:
            outfile.write(f"\n\n<!-- Source: {md_file.name} -->\n\n")
            content = md_file.read_text(encoding="utf-8")
            outfile.write(content)
            outfile.write("\n\n")


def generate_combined_pdf(
    docs_dir: Path,
    out_dir: Path,
    title: str,
    version: str,
    pdf_engine: str = "auto",
    margin: str = "2.5cm"
) -> int:
    """Generate a single PDF from all markdown files."""
    if not check_pandoc():
        print("ERROR: pandoc is not installed.")
        print("\nOn Windows, install with:")
        print("  winget install --id=JohnMacFarlane.Pandoc -e")
        print("\nYou'll also need MiKTeX or TeX Live for PDF generation:")
        print("  winget install --id=MiKTeX.MiKTeX -e")
        return 1

    if pdf_engine == "auto":
        pdf_engine = find_available_pdf_engine()
        if not pdf_engine:
            print("ERROR: No PDF engine found (pdflatex, xelatex, or lualatex).")
            print("\nPlease install MiKTeX or TeX Live.")
            return 1
        print(f"Using PDF engine: {pdf_engine}")
    else:
        print(f"Using specified PDF engine: {pdf_engine}")

    md_files = sorted(docs_dir.glob("*.md"))
    if not md_files:
        print(f"No Markdown files found in {docs_dir}")
        return 1

    print(f"Found {len(md_files)} markdown files:")
    for md_file in md_files:
        print(f"  - {md_file.name}")

    out_dir.mkdir(parents=True, exist_ok=True)
    temp_dir = out_dir / "temp"
    temp_dir.mkdir(exist_ok=True)

    cover_path = temp_dir / "cover.md"
    combined_path = temp_dir / "combined.md"

    current_date = datetime.now().strftime("%Y-%m-%d")
    create_cover_page(cover_path, title, version, current_date)

    combine_markdown_files(md_files, combined_path)

    final_combined = temp_dir / "final.md"
    with final_combined.open("w", encoding="utf-8") as outfile:
        outfile.write(cover_path.read_text(encoding="utf-8"))
        outfile.write(combined_path.read_text(encoding="utf-8"))

    output_pdf = out_dir / f"{docs_dir.name}-{version}.pdf"

    resource_path = os.pathsep.join([str(docs_dir), str(docs_dir.parent)])
    pandoc_cmd = [
        "pandoc",
        str(final_combined),
        "-o", str(output_pdf),
        "--pdf-engine", pdf_engine,
        "-V", "geometry:a4paper",
        "-V", f"geometry:margin={margin}",
        "-V", "documentclass=report",
        "-V", "fontsize=11pt",
        "--toc",
        "--toc-depth=3",
        "--number-sections",
        "--resource-path", resource_path,
        "-V", "colorlinks=true",
        "-V", "linkcolor=blue",
        "-V", "urlcolor=blue",
    ]

    if pdf_engine in ["xelatex", "lualatex"]:
        try:
            subprocess.run(
                ["fc-list", "DejaVu Sans"],
                capture_output=True,
                check=False
            )
            pandoc_cmd.extend(["-V", "mainfont=DejaVu Sans"])
        except FileNotFoundError:
            pass

    print(f"\nGenerating PDF: {output_pdf}")
    print(f"Command: {' '.join(pandoc_cmd)}")

    result = subprocess.run(
        pandoc_cmd,
        capture_output=True,
        text=True,
        check=False
    )

    if result.returncode != 0:
        print(f"\nERROR: Pandoc failed with return code {result.returncode}")
        if result.stderr:
            print(f"STDERR:\n{result.stderr}")
        if result.stdout:
            print(f"STDOUT:\n{result.stdout}")
        return 1

    print(f"\nSuccessfully created PDF: {output_pdf}")
    print(f"  Size: {output_pdf.stat().st_size / 1024:.1f} KB")

    import shutil
    shutil.rmtree(temp_dir)
    print(f"\nCleaned up temporary files in {temp_dir}")

    return 0


def main() -> int:
    """Main entry point."""
    repo_root = Path(__file__).resolve().parents[1]
    default_docs = repo_root / "documentation"
    default_out = repo_root / "build"

    parser = argparse.ArgumentParser(
        description="Generate a single combined PDF from all Markdown files in /documentation."
    )
    parser.add_argument(
        "--docs-dir",
        default=str(default_docs),
        help="Path to docs directory (default: %(default)s)"
    )
    parser.add_argument(
        "--out-dir",
        default=str(default_out),
        help="Path to output directory (default: %(default)s)"
    )
    parser.add_argument(
        "--title",
        default="Mentoring Documentation",
        help="Title of the document (default: %(default)s)"
    )
    parser.add_argument(
        "--version",
        default="1.0.0",
        help="Version of the document (default: %(default)s)"
    )
    parser.add_argument(
        "--pdf-engine",
        default="auto",
        choices=["auto", "xelatex", "pdflatex", "lualatex"],
        help="PDF engine to use (default: auto - detects available engine)"
    )
    parser.add_argument(
        "--margin",
        default="2.5cm",
        help="Page margin (default: %(default)s)"
    )

    args = parser.parse_args()

    return generate_combined_pdf(
        Path(args.docs_dir),
        Path(args.out_dir),
        args.title,
        args.version,
        args.pdf_engine,
        args.margin
    )


if __name__ == "__main__":
    raise SystemExit(main())
