import argparse
import os
import shutil
import subprocess
from pathlib import Path
from typing import Optional


def find_plantuml_jar(script_dir: Path) -> Optional[Path]:
    jar_env = os.environ.get("PLANTUML_JAR")
    if jar_env:
        jar_path = Path(jar_env)
        if jar_path.exists():
            return jar_path
    local_jar = script_dir / "plantuml.jar"
    if local_jar.exists():
        return local_jar
    return None


def find_plantuml_binary() -> Optional[str]:
    bin_env = os.environ.get("PLANTUML_BIN")
    if bin_env and shutil.which(bin_env):
        return bin_env
    return shutil.which("plantuml")


def run_plantuml(input_path: Path, output_dir: Path) -> Path:
    output_dir.mkdir(parents=True, exist_ok=True)
    output_svg = output_dir / f"{input_path.stem}.svg"

    plantuml_bin = find_plantuml_binary()
    jar_path = find_plantuml_jar(Path(__file__).parent)

    cmd = None
    if plantuml_bin:
        cmd = [plantuml_bin, "-tsvg", input_path.name]
    elif jar_path:
        cmd = ["java", "-jar", str(jar_path), "-tsvg", input_path.name]
    else:
        raise FileNotFoundError(
            "PlantUML not found. Set PLANTUML_BIN or PLANTUML_JAR, "
            "or place plantuml.jar in the tools folder."
        )

    result = subprocess.run(cmd, cwd=input_path.parent, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or "PlantUML failed.")

    generated_svg = input_path.with_suffix(".svg")
    if not generated_svg.exists():
        raise FileNotFoundError("Expected SVG was not generated.")

    if generated_svg.resolve() != output_svg.resolve():
        if output_svg.exists():
            output_svg.unlink()
        generated_svg.replace(output_svg)

    return output_svg


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert PlantUML to SVG.")
    parser.add_argument("input", help="Path to a .plantuml file")
    parser.add_argument("output_dir", help="Folder to place the SVG")
    args = parser.parse_args()

    input_path = Path(args.input).resolve()
    output_dir = Path(args.output_dir).resolve()

    if not input_path.exists():
        raise FileNotFoundError(f"Input file not found: {input_path}")
    if input_path.suffix.lower() not in (".plantuml", ".puml"):
        raise ValueError("Input file must have .plantuml or .puml extension.")

    svg_path = run_plantuml(input_path, output_dir)
    print(f"Wrote {svg_path}")


if __name__ == "__main__":
    main()
