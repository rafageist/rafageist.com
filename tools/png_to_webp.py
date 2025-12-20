from PIL import Image
import sys
import os

def png_to_webp(input_path, output_path=None, quality=80):
    if not os.path.isfile(input_path):
        raise FileNotFoundError("El archivo de entrada no existe")

    if output_path is None:
        output_path = os.path.splitext(input_path)[0] + ".webp"

    with Image.open(input_path) as img:
        img.save(output_path, "WEBP", quality=quality, method=6)

    print(f"Convertido: {input_path} -> {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python png_to_webp.py imagen.png [calidad]")
        sys.exit(1)

    input_png = sys.argv[1]
    quality = int(sys.argv[2]) if len(sys.argv) > 2 else 80

    png_to_webp(input_png, quality=quality)
