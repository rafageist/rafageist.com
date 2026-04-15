#!/usr/bin/env python3
"""
Article Generator for rafageist.com
Converts markdown articles from blog-reflections.wiki to HTML for the website.
"""

import os
import re
import sys
import json
import shutil
import hashlib
import subprocess
import urllib.request
import urllib.error
from pathlib import Path
from datetime import datetime
from html import escape


WIKI_REPO = "https://github.com/rafageist/blog-reflections.wiki.git"
WIKI_DIR = Path("_wiki_clone")
ARTICLES_DIR = Path("articles")
IMAGES_DIR = ARTICLES_DIR / "images"
PARTS_DIR = Path("parts")
MARKDOWN_EXT = ".md"

PUBLISHED_TAG = "#published"

HEADER_PART = None
FOOTER_PART = None


def load_parts():
    """Load header and footer parts from the parts directory."""
    global HEADER_PART, FOOTER_PART
    
    header_path = PARTS_DIR / "header.html"
    footer_path = PARTS_DIR / "footer.html"
    
    if header_path.exists():
        HEADER_PART = header_path.read_text(encoding="utf-8")
    else:
        HEADER_PART = ""
        print(f"Warning: {header_path} not found")
    
    if footer_path.exists():
        FOOTER_PART = footer_path.read_text(encoding="utf-8")
    else:
        FOOTER_PART = ""
        print(f"Warning: {footer_path} not found")


def run_cmd(cmd, cwd=None):
    """Execute shell command and return output."""
    result = subprocess.run(
        cmd,
        shell=True,
        capture_output=True,
        text=True,
        cwd=cwd
    )
    if result.returncode != 0:
        print(f"Command failed: {cmd}")
        print(f"stderr: {result.stderr}")
    return result.stdout.strip(), result.returncode


def remove_readonly(func, path, exc_info):
    """Handle permission errors on Windows when removing read-only files."""
    import os
    os.chmod(path, 0o777)
    func(path)


def clone_wiki():
    """Clone the wiki repository."""
    if WIKI_DIR.exists():
        shutil.rmtree(WIKI_DIR, onerror=remove_readonly)
    
    print(f"Cloning wiki from {WIKI_REPO}...")
    run_cmd(f"git clone --depth 1 {WIKI_REPO} {WIKI_DIR}")
    print("Wiki cloned successfully.")


def ensure_article_css():
    """Ensure article.css exists in the articles directory."""
    css_path = ARTICLES_DIR / "article.css"
    if css_path.exists():
        return
    
    css_content = """.articles-main {
    max-width: 900px;
    margin: calc(var(--header-offset) + 2rem) auto 3rem;
    padding: 0 1.5rem;
}

.articles-header {
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px dashed var(--border);
}

.articles-header h1 {
    margin: 0 0 0.5rem 0;
    font-size: clamp(1.5rem, 4vw, 2.2rem);
    color: var(--text);
}

.articles-description {
    margin: 0;
    color: var(--muted);
    font-size: 1rem;
}

.timeline {
    display: flex;
    flex-direction: column;
    gap: 0;
}

.timeline-year {
    position: relative;
    padding-left: 2rem;
    padding-bottom: 2.5rem;
    border-left: 2px solid var(--border);
}

.timeline-year:last-child {
    border-left-color: transparent;
    padding-bottom: 0;
}

.timeline-year::before {
    content: '';
    position: absolute;
    left: -5px;
    top: 0.45rem;
    width: 8px;
    height: 8px;
    background: var(--accent);
    border-radius: 50%;
}

.timeline-year-header {
    display: flex;
    align-items: baseline;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 0.75rem;
}

.timeline-year-number {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--text);
}

.timeline-year-count {
    color: var(--muted);
    font-size: 0.9rem;
}

.articles-grid {
    display: grid;
    gap: 1.5rem;
}

.article-card {
    display: grid;
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.92);
    overflow: hidden;
    transition: box-shadow 0.2s ease;
}

.article-card:hover {
    box-shadow: 0 10px 24px rgba(42, 36, 30, 0.12);
}

.article-card-image {
    aspect-ratio: 21 / 9;
    overflow: hidden;
    background: #f4e5cf;
}

.article-card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.article-card-content {
    padding: 1.2rem 1.4rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.article-card-date {
    font-size: 0.85rem;
    color: var(--muted);
    font-weight: 600;
}

.article-card-title {
    margin: 0;
    font-size: 1.25rem;
    line-height: 1.3;
}

.article-card-title a {
    color: var(--text);
}

.article-card-title a:hover {
    color: var(--accent);
}

.article-card-summary {
    margin: 0;
    color: var(--muted);
    font-size: 0.95rem;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.read-more {
    margin-top: auto;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    color: var(--accent);
    font-weight: 700;
    font-size: 0.9rem;
}

.read-more:hover {
    color: #4f3f2c;
}

.article-main {
    max-width: 800px;
    margin: calc(var(--header-offset) + 2rem) auto 3rem;
    padding: 0 1.5rem;
}

.article {
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid var(--border);
    padding: 2rem;
}

.article-hero {
    aspect-ratio: 21 / 9;
    overflow: hidden;
    background: #f4e5cf;
}

.article-hero img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.article-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px dashed var(--border);
}

.article-date {
    font-size: 0.9rem;
    color: var(--muted);
    font-weight: 600;
}

.article-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
}

.article-tag {
    display: inline-block;
    padding: 0.2rem 0.5rem;
    font-size: 0.8rem;
    color: var(--accent);
    background: rgba(107, 83, 54, 0.1);
    border: 1px solid rgba(107, 83, 54, 0.25);
}

.article-tag:hover {
    background: rgba(107, 83, 54, 0.2);
    color: var(--accent);
}

.article-title {
    margin: 0 0 1.5rem 0;
    font-size: clamp(1.5rem, 5vw, 2.4rem);
    line-height: 1.25;
    color: var(--text);
}

.article-content {
    line-height: 1.75;
}

.article-content h2 {
    margin: 2rem 0 1rem;
    font-size: 1.4rem;
    color: var(--text);
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border);
}

.article-content h3 {
    margin: 1.5rem 0 0.75rem;
    font-size: 1.2rem;
    color: var(--text);
}

.article-content p {
    margin: 1rem 0;
}

.article-content ul,
.article-content ol {
    margin: 1rem 0;
    padding-left: 1.5rem;
}

.article-content li {
    margin: 0.5rem 0;
}

.article-content blockquote {
    margin: 1.5rem 0;
    padding: 1rem 1.25rem;
    border-left: 4px solid var(--accent);
    background: rgba(107, 83, 54, 0.08);
    font-style: italic;
}

.article-content code {
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.9em;
    background: rgba(107, 83, 54, 0.1);
    padding: 0.15rem 0.4rem;
    border-radius: 3px;
}

.article-content pre {
    background: #2f2e2e;
    color: #f6f1e8;
    padding: 1rem 1.25rem;
    overflow-x: auto;
    margin: 1.5rem 0;
}

.article-content pre code {
    background: none;
    padding: 0;
    font-size: 0.9rem;
    color: inherit;
}

.article-content img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 1.5rem 0;
}

.article-content a {
    color: var(--glossary-link);
    text-decoration: underline;
    text-decoration-color: var(--glossary-link-underline);
}

.article-content a:hover {
    color: var(--glossary-link-hover);
}

.article-content strong {
    font-weight: 700;
    color: var(--text);
}

.article-footer {
    margin-top: 2.5rem;
    padding-top: 1.5rem;
    border-top: 1px dashed var(--border);
}

.back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--accent);
    font-weight: 700;
    font-size: 0.95rem;
}

.back-link:hover {
    color: #4f3f2c;
}

.callout {
    margin: 1.5rem 0;
    padding: 1rem 1.25rem;
    border: 1px solid var(--border);
    background: rgba(107, 83, 54, 0.05);
}

.callout strong {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.callout p {
    margin: 0;
}

.callout-tip {
    border-left: 4px solid #378152;
    background: rgba(55, 129, 82, 0.08);
}

.callout-tip strong {
    color: #378152;
}

.callout-important {
    border-left: 4px solid #b00020;
    background: rgba(176, 0, 32, 0.08);
}

.callout-important strong {
    color: #b00020;
}

@media (max-width: 640px) {
    .article {
        padding: 1.25rem;
    }

    .article-hero {
        margin: -1.25rem -1.25rem 1.25rem;
    }

    .article-meta {
        flex-direction: column;
        align-items: flex-start;
    }
}
"""
    with open(css_path, 'w', encoding='utf-8') as f:
        f.write(css_content)
    print(f"Generated: {css_path}")


def get_articles_with_published_tag():
    """Find all markdown files containing #published tag."""
    articles = []
    
    for md_file in WIKI_DIR.glob(f"*{MARKDOWN_EXT}"):
        try:
            content = md_file.read_text(encoding="utf-8")
            if PUBLISHED_TAG in content:
                articles.append(md_file)
        except Exception as e:
            print(f"Error reading {md_file}: {e}")
    
    articles.sort(key=lambda x: x.name)
    print(f"Found {len(articles)} articles with #{PUBLISHED_TAG[1:]}")
    return articles


def extract_metadata(content):
    """Extract article metadata from markdown content."""
    lines = content.split("\n")
    
    metadata = {
        "image_url": None,
        "tags": [],
        "title": None,
        "date": "",
        "content_start": 0
    }
    
    tags = []
    title = None
    image_url = None
    content_start = 0
    hex_color_pattern = re.compile(r'^[0-9a-fA-F]{3,6}$')
    in_code_block = False
    
    for i, line in enumerate(lines):
        line_stripped = line.strip()
        
        if line_stripped.startswith('```'):
            in_code_block = not in_code_block
            continue
        
        if in_code_block:
            continue
        
        if image_url is None:
            img_match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', line_stripped, re.IGNORECASE)
            if img_match:
                image_url = img_match.group(1)
        
        if not image_url:
            md_img_match = re.match(r'!\[.*?\]\((.*?)\)', line_stripped)
            if md_img_match:
                image_url = md_img_match.group(1)
        
        tag_match = re.findall(r'#(\w+)', line_stripped)
        if tag_match:
            for t in tag_match:
                if t not in tags and not hex_color_pattern.match(t) and t.lower() not in ['published']:
                    tags.append(t)
        
        if i < 10 and line_stripped.startswith("# ") and not title:
            heading_text = line_stripped[2:].strip().lower()
            if heading_text not in ['introduction', 'published', 'conclusion']:
                title = line_stripped[2:].strip()
                content_start = i + 1
    
    metadata["image_url"] = image_url
    metadata["tags"] = tags
    metadata["title"] = title
    metadata["content_start"] = content_start if content_start > 0 else 1
    
    return metadata


def extract_slug(filename):
    """Extract year, number, title slug from filename like '2025.001.-Title.md'.
    Returns: (year, number, url_slug)
    Example: '2025.001.-Title.md' -> ('2025', '001', '001-title')
    """
    name = Path(filename).stem
    match = re.match(r'(\d{4})\.(\d+)\.-?(.*)', name)
    if match:
        year = match.group(1)
        number = match.group(2)
        title_slug = match.group(3).strip()
        url_slug = f"{number}-{title_slug}"
        return year, number, url_slug
    return name, "000", name


def download_image(url, dest_path):
    """Download image and save to destination."""
    if not url or not url.startswith("http"):
        return None
    
    os.makedirs(dest_path.parent, exist_ok=True)
    
    try:
        req = urllib.request.Request(
            url,
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        )
        
        with urllib.request.urlopen(req, timeout=30) as response:
            final_url = response.geturl()
            
            if "github.com/user-attachments" in url:
                pass
            
            with open(dest_path, 'wb') as f:
                shutil.copyfileobj(response, f)
        
        print(f"  Downloaded image to {dest_path}")
        return str(dest_path)
    
    except Exception as e:
        print(f"  Failed to download {url}: {e}")
        return None


def parse_inline(text):
    """Parse inline markdown elements."""
    text = escape(text)
    
    text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
    text = re.sub(r'\*(.+?)\*', r'<em>\1</em>', text)
    text = re.sub(r'`(.+?)`', r'<code>\1</code>', text)
    
    text = re.sub(r'\[([^\]]+)\]\(([^\)]+)\)', r'<a href="\2">\1</a>', text)
    
    return text


def convert_heading(match):
    """Convert markdown heading to HTML."""
    level = len(match.group(1))
    text = match.group(2).strip()
    return f'<h{level}>{parse_inline(text)}</h{level}>\n'


def convert_blockquote(content):
    """Convert blockquote including [!TIP], [!IMPORTANT] blocks."""
    lines = content.split('\n')
    html_lines = []
    current_callout = None
    callout_content = []
    
    for line in lines:
        tip_match = re.match(r'>\s*\[!(TIP|IMPORTANT|NOTE|WARNING)\]\s*(.*)', line, re.IGNORECASE)
        simple_quote = line.startswith('>')
        
        if tip_match:
            if current_callout:
                html_lines.append(f'<div class="callout callout-{current_callout.lower()}">')
                html_lines.append(f'<strong>{current_callout.capitalize()}</strong>')
                html_lines.append(f'<p>{" ".join(callout_content)}</p>')
                html_lines.append('</div>')
            
            current_callout = tip_match.group(1).upper()
            remainder = tip_match.group(2).strip()
            callout_content = [remainder] if remainder else []
        
        elif line.startswith('> '):
            if current_callout:
                text = line[2:].strip()
                if text:
                    callout_content.append(text)
            else:
                text = line[2:].strip()
                if text:
                    html_lines.append(f'<blockquote>{parse_inline(text)}</blockquote>')
        
        elif line.startswith('>'):
            if current_callout:
                text = line[1:].strip()
                if text:
                    callout_content.append(text)
        
        elif current_callout and line.strip() == '':
            continue
        
        else:
            if current_callout:
                html_lines.append(f'<div class="callout callout-{current_callout.lower()}">')
                html_lines.append(f'<strong>{current_callout.capitalize()}</strong>')
                html_lines.append(f'<p>{" ".join(callout_content)}</p>')
                html_lines.append('</div>')
                current_callout = None
                callout_content = []
            
            if line.strip():
                html_lines.append(parse_inline(line))
    
    if current_callout:
        html_lines.append(f'<div class="callout callout-{current_callout.lower()}">')
        html_lines.append(f'<strong>{current_callout.capitalize()}</strong>')
        html_lines.append(f'<p>{" ".join(callout_content)}</p>')
        html_lines.append('</div>')
    
    return '\n'.join(html_lines)


def convert_code_block(match):
    """Convert markdown code block to HTML."""
    code = escape(match.group(1).strip())
    return f'<pre><code>{code}</code></pre>\n'


def convert_paragraph(lines):
    """Convert lines to paragraph HTML."""
    html = []
    current_paragraph = []
    
    for line in lines:
        stripped = line.strip()
        
        if not stripped:
            if current_paragraph:
                html.append(f'<p>{" ".join(current_paragraph)}</p>')
                current_paragraph = []
        else:
            current_paragraph.append(parse_inline(stripped))
    
    if current_paragraph:
        html.append(f'<p>{" ".join(current_paragraph)}</p>')
    
    return '\n'.join(html)


def convert_list(content):
    """Convert markdown lists to HTML."""
    lines = content.split('\n')
    html = []
    in_ul = False
    in_ol = False
    
    for line in lines:
        stripped = line.strip()
        
        ul_match = re.match(r'^[\-\*]\s+(.*)', stripped)
        ol_match = re.match(r'^\d+\.\s+(.*)', stripped)
        
        if ul_match:
            if in_ol:
                html.append('</ol>')
                in_ol = False
            if not in_ul:
                html.append('<ul>')
                in_ul = True
            html.append(f'<li>{parse_inline(ul_match.group(1))}</li>')
        
        elif ol_match:
            if in_ul:
                html.append('</ul>')
                in_ul = False
            if not in_ol:
                html.append('<ol>')
                in_ol = True
            html.append(f'<li>{parse_inline(ol_match.group(1))}</li>')
        
        else:
            if in_ul:
                html.append('</ul>')
                in_ul = False
            if in_ol:
                html.append('</ol>')
                in_ol = False
            if stripped:
                html.append(f'<p>{parse_inline(stripped)}</p>')
    
    if in_ul:
        html.append('</ul>')
    if in_ol:
        html.append('</ol>')
    
    return '\n'.join(html)


def convert_horizontal_rule():
    """Return HTML for horizontal rule."""
    return '<hr>\n'


def convert_content_with_html(content):
    """Convert content that may contain both HTML and markdown to HTML."""
    html_parts = []
    lines = content.split('\n')
    
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        if stripped.startswith('<') and not stripped.startswith('</'):
            if stripped.startswith(('<h1', '<h2', '<h3', '<h4', '<h5', '<h6', '<p', '<ul', '<ol', '<li', '<pre', '<blockquote', '<div', '<table', '<tr', '<td')):
                if stripped.startswith(('<h1', '<h2', '<h3', '<h4', '<h5', '<h6')):
                    html_parts.append(line)
                    i += 1
                    continue
                html_parts.append(line)
                i += 1
                continue
            elif stripped.startswith('</'):
                html_parts.append(line)
                i += 1
                continue
            else:
                html_parts.append(line)
                i += 1
                continue
        
        if not stripped:
            i += 1
            continue
        
        if stripped.startswith('#'):
            heading_match = re.match(r'^(#{1,6})\s+(.*)', stripped)
            if heading_match:
                html_parts.append(f'<h{len(heading_match.group(1))}>{parse_inline(heading_match.group(2))}</h{len(heading_match.group(1))}>')
                i += 1
                continue
        
        if stripped.startswith('>'):
            blockquote_lines = []
            while i < len(lines) and (lines[i].strip().startswith('>') or lines[i].strip() == ''):
                blockquote_lines.append(lines[i])
                i += 1
            html_parts.append(convert_blockquote('\n'.join(blockquote_lines)))
            continue
        
        if stripped.startswith('```'):
            code_lines = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith('```'):
                code_lines.append(lines[i])
                i += 1
            i += 1
            code = '\n'.join(code_lines)
            html_parts.append(f'<pre><code>{escape(code.strip())}</code></pre>')
            continue
        
        if stripped.startswith(('- ', '* ')) or re.match(r'^\d+\.\s', stripped):
            list_lines = []
            while i < len(lines):
                s = lines[i].strip()
                if s.startswith(('- ', '* ')) or re.match(r'^\d+\.\s', s) or s == '':
                    if s == '':
                        break
                    list_lines.append(s)
                    i += 1
                else:
                    break
            html_parts.append(convert_list('\n'.join(list_lines)))
            continue
        
        if stripped == '---' or stripped == '***' or stripped == '___':
            html_parts.append('<hr>')
            i += 1
            continue
        
        paragraph_lines = []
        while i < len(lines):
            s = lines[i].strip()
            if s and not s.startswith(('#', '```', '>', '- ', '* ')) and not re.match(r'^\d+\.\s', s) and s != '---' and not s.startswith('<') and not s.startswith('</'):
                paragraph_lines.append(s)
                i += 1
            else:
                break
        
        if paragraph_lines:
            html_parts.append(convert_paragraph(paragraph_lines))
        
        i += 1
    
    return '\n'.join(html_parts)


def convert_markdown_to_html(content):
    """Convert markdown content to HTML."""
    html_parts = []
    lines = content.split('\n')
    
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        if not stripped:
            i += 1
            continue
        
        if stripped.startswith('#'):
            heading_match = re.match(r'^(#{1,6})\s+(.*)', stripped)
            if heading_match:
                html_parts.append(f'<h{len(heading_match.group(1))}>{parse_inline(heading_match.group(2))}</h{len(heading_match.group(1))}>')
                i += 1
                continue
        
        if stripped.startswith('>'):
            blockquote_lines = []
            while i < len(lines) and (lines[i].strip().startswith('>') or lines[i].strip() == ''):
                blockquote_lines.append(lines[i])
                i += 1
            html_parts.append(convert_blockquote('\n'.join(blockquote_lines)))
            continue
        
        if stripped.startswith('```'):
            code_lines = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith('```'):
                code_lines.append(lines[i])
                i += 1
            i += 1
            code = '\n'.join(code_lines)
            html_parts.append(f'<pre><code>{escape(code.strip())}</code></pre>')
            continue
        
        if stripped.startswith(('- ', '* ')) or re.match(r'^\d+\.\s', stripped):
            list_lines = []
            while i < len(lines):
                s = lines[i].strip()
                if s.startswith(('- ', '* ')) or re.match(r'^\d+\.\s', s) or s == '':
                    if s == '':
                        break
                    list_lines.append(s)
                    i += 1
                else:
                    break
            html_parts.append(convert_list('\n'.join(list_lines)))
            continue
        
        if stripped == '---' or stripped == '***' or stripped == '___':
            html_parts.append('<hr>')
            i += 1
            continue
        
        paragraph_lines = []
        while i < len(lines):
            s = lines[i].strip()
            if s and not s.startswith(('#', '```', '>', '- ', '* ')) and not re.match(r'^\d+\.\s', s) and s != '---':
                paragraph_lines.append(s)
                i += 1
            else:
                break
        
        if paragraph_lines:
            html_parts.append(convert_paragraph(paragraph_lines))
        
        i += 1
    
    return '\n'.join(html_parts)


def generate_article_html(article_path, year, url_slug, title, number, tags, image_path, content_html):
    """Generate HTML for a single article."""
    
    tags_html = ""
    for tag in tags:
        if tag != "published":
            tags_html += f'<a href="#" class="article-tag">#{tag}</a>'
    
    article_url = f"/articles/{year}/{url_slug}.html"
    back_url = f"/articles/{year}/"
    
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{escape(title)} | rafageist.com</title>
    <meta name="description" content="{escape(title)}">
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="/articles/article.css">
    <link rel="icon" href="https://avatars.githubusercontent.com/u/25892480?v=4" type="image/x-icon">
    <link rel="canonical" href="https://rafageist.com{article_url}">
</head>
<body>
{HEADER_PART}
    <main class="article-main">
        <article class="article">
            <div class="article-hero">
                <img src="{image_path}" alt="">
            </div>
            <div class="article-meta">
                <span class="article-date">{year}.{number}</span>
                <div class="article-tags">
                    {tags_html}
                </div>
            </div>
            <h1 class="article-title">{escape(title)}</h1>
            <div class="article-content">
                {content_html}
            </div>
            <footer class="article-footer">
                <a href="{back_url}" class="back-link">← Back to {year} Articles</a>
            </footer>
        </article>
    </main>
{FOOTER_PART}
</body>
</html>"""
    
    return html


def generate_years_index_html(years_articles):
    """Generate HTML index page with timeline of years and article cards."""
    
    timeline_html = []
    for year, articles in sorted(years_articles.items(), reverse=True):
        sorted_articles = sorted(articles, key=lambda x: x["number"])
        count = len(sorted_articles)
        
        cards_html = []
        for article in sorted_articles:
            a_year, number, url_slug = article["year"], article["number"], article["url_slug"]
            title = article["title"]
            image_path = article["image_path"]
            summary = article["summary"]
            article_url = f"/articles/{a_year}/{url_slug}.html"
            
            cards_html.append(f"""
                <article class="article-card">
                    <div class="article-card-image">
                        <img src="{image_path}" alt="">
                    </div>
                    <div class="article-card-content">
                        <span class="article-card-date">{a_year}.{number}</span>
                        <h2 class="article-card-title">{escape(title)}</h2>
                        <p class="article-card-summary">{escape(summary)}...</p>
                        <a href="{article_url}" class="read-more">Read more →</a>
                    </div>
                </article>""")
        
        timeline_html.append(f"""
        <section class="timeline-year">
            <div class="timeline-year-header">
                <h2 class="timeline-year-number">{year}</h2>
                <span class="timeline-year-count">{count} article{'s' if count != 1 else ''}</span>
            </div>
            <div class="articles-grid">
                {''.join(cards_html)}
            </div>
        </section>""")
    
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Articles | rafageist.com</title>
    <meta name="description" content="Articles and reflections by Rafa Rodríguez on software engineering, technology, and philosophy.">
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="/articles/article.css">
    <link rel="icon" href="https://avatars.githubusercontent.com/u/25892480?v=4" type="image/x-icon">
    <link rel="canonical" href="https://rafageist.com/articles/">
    <meta property="og:title" content="Articles | rafageist.com">
    <meta property="og:description" content="Articles and reflections by Rafa Rodríguez on software engineering, technology, and philosophy.">
    <meta property="og:type" content="website">
</head>
<body>
{HEADER_PART}
    <main class="articles-main">
        <div class="articles-header">
            <h1>Articles</h1>
            <p class="articles-description">Reflections on software engineering, technology, and philosophy.</p>
        </div>
        <div class="timeline">
            {''.join(timeline_html)}
        </div>
    </main>
{FOOTER_PART}
</body>
</html>"""
    
    return html


def generate_year_index_html(year, articles_data):
    """Generate HTML index page for a specific year."""
    
    cards_html = []
    for article in articles_data:
        year, number, url_slug = article["year"], article["number"], article["url_slug"]
        title = article["title"]
        image_path = article["image_path"]
        summary = article["summary"]
        article_url = f"/articles/{year}/{url_slug}.html"
        
        cards_html.append(f"""
        <article class="article-card">
            <div class="article-card-image">
                <img src="{image_path}" alt="">
            </div>
            <div class="article-card-content">
                <span class="article-card-date">{year}.{number}</span>
                <h2 class="article-card-title">{escape(title)}</h2>
                <p class="article-card-summary">{escape(summary)}...</p>
                <a href="{article_url}" class="read-more">Read more →</a>
            </div>
        </article>""")
    
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Articles {year} | rafageist.com</title>
    <meta name="description" content="Articles from {year} by Rafa Rodríguez on software engineering, technology, and philosophy.">
    <link rel="stylesheet" href="/style.css">
    <link rel="stylesheet" href="/articles/article.css">
    <link rel="icon" href="https://avatars.githubusercontent.com/u/25892480?v=4" type="image/x-icon">
    <link rel="canonical" href="https://rafageist.com/articles/{year}/">
    <meta property="og:title" content="Articles {year} | rafageist.com">
    <meta property="og:description" content="Articles from {year} by Rafa Rodríguez on software engineering, technology, and philosophy.">
    <meta property="og:type" content="website">
</head>
<body>
{HEADER_PART}
    <main class="articles-main">
        <div class="articles-header">
            <h1>{year} Articles</h1>
            <p class="articles-description">{len(articles_data)} article{'s' if len(articles_data) != 1 else ''}</p>
            <a href="/articles/" class="back-link">← All Years</a>
        </div>
        <div class="articles-grid">
            {''.join(cards_html)}
        </div>
    </main>
{FOOTER_PART}
</body>
</html>"""
    
    return html


def process_article(md_path):
    """Process a single markdown article."""
    content = md_path.read_text(encoding="utf-8")
    
    metadata = extract_metadata(content)
    
    year, number, url_slug = extract_slug(md_path.name)
    filename_slug = url_slug
    
    if not metadata["title"]:
        title_from_slug = filename_slug
        if title_from_slug.startswith(f"{number}-"):
            title_from_slug = title_from_slug[len(number)+1:]
        metadata["title"] = title_from_slug.replace('-', ' ')
    
    if not metadata["image_url"]:
        metadata["image_url"] = "/articles/images/placeholder.webp"
    
    image_ext = ".png" if "png" in metadata["image_url"] else ".jpg"
    if "user-attachments" in metadata["image_url"]:
        url_hash = hashlib.md5(metadata["image_url"].encode()).hexdigest()[:12]
        image_filename = f"{url_hash}{image_ext}"
    else:
        image_filename = f"{year}-{number}{image_ext}"
    
    image_path = IMAGES_DIR / image_filename
    
    if metadata["image_url"] != "/articles/images/placeholder.webp":
        download_image(metadata["image_url"], image_path)
    
    body_lines_all = content.split('\n')
    body_content = '\n'.join(body_lines_all[metadata["content_start"]:])
    
    hero_image_url = metadata["image_url"]
    
    final_lines = []
    first_image_removed = False
    for line in body_content.split('\n'):
        stripped = line.strip()
        if stripped.startswith('*Written by'):
            break
        if stripped.startswith('---') and len(final_lines) > 0:
            break
        
        if not first_image_removed and hero_image_url:
            img_match = re.search(r'<img[^>]+src=["\']([^"\']+)["\']', stripped, re.IGNORECASE)
            if img_match and hero_image_url in img_match.group(1):
                first_image_removed = True
                continue
        
        final_lines.append(line)
    
    body_content = '\n'.join(final_lines)
    
    content_html = convert_content_with_html(body_content)
    
    summary = ""
    plain_text = re.sub(r'<[^>]+>', '', content_html)
    plain_text = re.sub(r'\s+', ' ', plain_text).strip()
    summary = plain_text[:200] if len(plain_text) > 200 else plain_text
    
    article_data = {
        "year": year,
        "number": number,
        "url_slug": url_slug,
        "title": metadata["title"],
        "tags": metadata["tags"],
        "image_path": "/" + str(image_path).replace("\\", "/"),
        "content_html": content_html,
        "summary": summary
    }
    
    return article_data


def main():
    """Main function to generate articles."""
    print("=" * 50)
    print("Article Generator for rafageist.com")
    print("=" * 50)
    
    load_parts()
    clone_wiki()
    
    articles = get_articles_with_published_tag()
    
    if not articles:
        print("No articles found with #published tag.")
        return
    
    processed_articles = []
    
    for md_path in articles:
        print(f"\nProcessing: {md_path.name}")
        
        try:
            article_data = process_article(md_path)
            
            year = article_data["year"]
            url_slug = article_data["url_slug"]
            
            article_dir = ARTICLES_DIR / year
            os.makedirs(article_dir, exist_ok=True)
            
            html = generate_article_html(
                md_path,
                year,
                url_slug,
                article_data["title"],
                article_data["number"],
                article_data["tags"],
                article_data["image_path"],
                article_data["content_html"]
            )
            
            article_html_path = article_dir / f"{url_slug}.html"
            with open(article_html_path, 'w', encoding='utf-8') as f:
                f.write(html)
            print(f"  Generated: {article_html_path}")
            
            processed_articles.append(article_data)
        
        except Exception as e:
            print(f"  Error processing {md_path.name}: {e}")
            import traceback
            traceback.print_exc()
    
    years_articles = {}
    for article in processed_articles:
        year = article["year"]
        if year not in years_articles:
            years_articles[year] = []
        years_articles[year].append(article)
    
    print("\nGenerating years index...")
    years_html = generate_years_index_html(years_articles)
    index_path = ARTICLES_DIR / "index.html"
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(years_html)
    print(f"Generated: {index_path}")
    
    print("\nGenerating year indexes...")
    for year, articles in years_articles.items():
        year_articles = sorted(articles, key=lambda x: x["number"])
        year_html = generate_year_index_html(year, year_articles)
        year_path = ARTICLES_DIR / year / "index.html"
        with open(year_path, 'w', encoding='utf-8') as f:
            f.write(year_html)
        print(f"Generated: {year_path}")
    
    ensure_article_css()
    
    if WIKI_DIR.exists():
        shutil.rmtree(WIKI_DIR, onerror=remove_readonly)
    
    print("\n" + "=" * 50)
    print(f"Done! Generated {len(processed_articles)} articles in {len(years_articles)} years.")
    print("=" * 50)


if __name__ == "__main__":
    main()
