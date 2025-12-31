"""WebP to PNG Converter

This script converts WebP images to PNG format.
PNG format provides lossless quality and wide compatibility.
It can convert a single WebP file or all WebPs inside a folder.
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

def convert_folder(folder_path):
    """Convert all WebP files in a folder to PNG."""
    webp_files = [
        file_name
        for file_name in os.listdir(folder_path)
        if os.path.isfile(os.path.join(folder_path, file_name))
        and os.path.splitext(file_name)[1].lower() == ".webp"
    ]

    if not webp_files:
        print(f"No WebP files found in: {folder_path}")
        return

    for file_name in sorted(webp_files):
        input_path = os.path.join(folder_path, file_name)
        output_path = os.path.splitext(input_path)[0] + ".png"
        webp_to_png(input_path, output_path=output_path)

if __name__ == "__main__":
    print("=== WebP to PNG Converter ===")
    print("Convert WebP images to PNG format\n")
    
    if len(sys.argv) < 2:
        print("Usage: python webp_to_png.py <file_or_folder>")
        print("  file_or_folder: Path to a WebP file or a folder with WebPs")
        sys.exit(1)

    input_path = sys.argv[1]

    if os.path.isdir(input_path):
        convert_folder(input_path)
    else:
        webp_to_png(input_path)
