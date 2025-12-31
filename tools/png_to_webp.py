"""PNG to WebP Converter

This script converts PNG images to WebP format with customizable quality settings.
WebP format provides superior compression while maintaining image quality.
It can convert a single PNG file or all PNGs inside a folder.
"""

from PIL import Image
import sys
import os

def png_to_webp(input_path, output_path=None, quality=80, remove_input=False):
    """Convert a PNG image to WebP format.
    
    Args:
        input_path (str): Path to the input PNG file
        output_path (str, optional): Path for the output WebP file. 
                                     If None, uses the same name with .webp extension
        quality (int, optional): WebP quality (0-100). Default is 80
        remove_input (bool, optional): Remove the source PNG after conversion
        
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
    if remove_input and os.path.isfile(output_path) and input_path != output_path:
        try:
            os.remove(input_path)
        except OSError as exc:
            print(f"Warning: could not remove {input_path}: {exc}")

def convert_folder(folder_path, quality=80, remove_input=False):
    """Convert all PNG files in a folder to WebP."""
    png_files = [
        file_name
        for file_name in os.listdir(folder_path)
        if os.path.isfile(os.path.join(folder_path, file_name))
        and os.path.splitext(file_name)[1].lower() == ".png"
    ]

    if not png_files:
        print(f"No PNG files found in: {folder_path}")
        return

    for file_name in sorted(png_files):
        input_path = os.path.join(folder_path, file_name)
        output_path = os.path.splitext(input_path)[0] + ".webp"
        png_to_webp(
            input_path,
            output_path=output_path,
            quality=quality,
            remove_input=remove_input
        )

if __name__ == "__main__":
    print("=== PNG to WebP Converter ===")
    print("Convert PNG images to WebP format\n")
    
    if len(sys.argv) < 2:
        print("Usage: python png_to_webp.py <file_or_folder> [quality]")
        print("  file_or_folder: Path to a PNG file or a folder with PNGs")
        print("  quality: Optional quality setting (0-100, default: 80)")
        sys.exit(1)

    input_path = sys.argv[1]
    quality = 80
    if len(sys.argv) > 2:
        try:
            quality = int(sys.argv[2])
        except ValueError:
            print("Quality must be an integer between 0 and 100.")
            sys.exit(1)

    if os.path.isdir(input_path):
        convert_folder(input_path, quality=quality, remove_input=True)
    else:
        png_to_webp(input_path, quality=quality, remove_input=True)
