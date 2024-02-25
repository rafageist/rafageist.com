<?php

include __DIR__ . '/vendor/autoload.php';

use divengine\div;

function explorarDirectorio($directorio)
{
    echo "[INFO] Exploring $directorio\n";
    $archivos = scandir($directorio);

    foreach ($archivos as $archivo) {
        if ($archivo == '.' || $archivo == '..') {
            continue;
        }

        $ruta = $directorio . '/' . $archivo;
        $ext = is_dir($ruta) ? "" : pathinfo($ruta)['extension'];

        if (is_dir($ruta)) {
            // Si es un directorio, explóralo recursivamente
            explorarDirectorio($ruta);
        } elseif ($ext == 'html' || $ext == 'json' || $ext == 'xml' || strpos($ruta, 'graph-data.js') !== false) {

            $tpl = new div($ruta, [
                "nocache" => uniqid(),
                "sitename" => "rafageist"
            ]);

            $output = "$tpl";

            if ($ext == 'html') {
                $analyticsCode = file_get_contents(__DIR__ . "/.dev/analytics.html");
                if (strpos($output, '</head>') !== false && strpos($output, 'https://www.googletagmanager.com') === false) {
                    $output = str_replace('</head>', $analyticsCode . '</head>', $output);
                }
            }
            
           /* // Configuración de Tidy
            $config = array(
                'indent'         => true,
                'output-xhtml'   => false,
                'wrap'           => 200
            );

            // Crear instancia de Tidy
            $tidy = new \Tidy();
            $tidy->parseString($output, $config, 'utf8');
            $tidy->cleanRepair();

            // Mostrar el HTML formateado
            $output = "$tidy";*/

            file_put_contents($ruta, $output);
        }
    }
}

// Ruta del directorio a explorar (ajústala según tu estructura de carpetas)
$directorioBase = __DIR__ . '/public';

explorarDirectorio($directorioBase);

echo "Proceso completado.";
