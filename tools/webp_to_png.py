"""WebP to PNG Converter

This script converts WebP images to PNG format.
PNG format provides lossless quality and wide compatibility.
"""

from PIL import Image
import sys
import os

def webp_to_png(input_path, output_path=None):
    """Convert a WebP image to PNG format.
    
    Args:
        input_path (str): Path to the input WebP file
        output_path (str, optional): Path for the output PNG file. 
                                     If None, uses the same name with .png extension
        
    Raises:
        FileNotFoundError: If the input file doesn't exist
    """
    if not os.path.isfile(input_path):
        raise FileNotFoundError("Input file does not exist")

    if output_path is None:
        output_path = os.path.splitext(input_path)[0] + ".png"

    with Image.open(input_path) as img:
        # Convert to RGB if necessary (WebP can have alpha channel)
        if img.mode in ('RGBA', 'LA'):
            img.save(output_path, "PNG")
        else:
            img.convert('RGB').save(output_path, "PNG")

    print(f"Converted: {input_path} -> {output_path}")

if __name__ == "__main__":
    print("=== WebP to PNG Converter ===")
    print("Convert WebP images to PNG format\n")
    
    if len(sys.argv) < 2:
        print("Usage: python webp_to_png.py image.webp")
        print("  image.webp: Path to the WebP file to convert")
        sys.exit(1)

    input_webp = sys.argv[1]

    webp_to_png(input_webp)
