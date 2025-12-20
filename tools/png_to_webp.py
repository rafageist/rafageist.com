"""PNG to WebP Converter

This script converts PNG images to WebP format with customizable quality settings.
WebP format provides superior compression while maintaining image quality.
"""

from PIL import Image
import sys
import os

def png_to_webp(input_path, output_path=None, quality=80):
    """Convert a PNG image to WebP format.
    
    Args:
        input_path (str): Path to the input PNG file
        output_path (str, optional): Path for the output WebP file. 
                                     If None, uses the same name with .webp extension
        quality (int, optional): WebP quality (0-100). Default is 80
        
    Raises:
        FileNotFoundError: If the input file doesn't exist
    """
    if not os.path.isfile(input_path):
        raise FileNotFoundError("Input file does not exist")

    if output_path is None:
        output_path = os.path.splitext(input_path)[0] + ".webp"

    with Image.open(input_path) as img:
        img.save(output_path, "WEBP", quality=quality, method=6)

    print(f"Converted: {input_path} -> {output_path}")

if __name__ == "__main__":
    print("=== PNG to WebP Converter ===")
    print("Convert PNG images to WebP format\n")
    
    if len(sys.argv) < 2:
        print("Usage: python png_to_webp.py image.png [quality]")
        print("  image.png: Path to the PNG file to convert")
        print("  quality: Optional quality setting (0-100, default: 80)")
        sys.exit(1)

    input_png = sys.argv[1]
    quality = int(sys.argv[2]) if len(sys.argv) > 2 else 80

    png_to_webp(input_png, quality=quality)
