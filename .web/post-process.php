<?php

include __DIR__.'/vendor/autoload.php';

use divengine\div;
/*
function agregarGoogleAnalytics($ruta)
{
    
    echo "[INFO] Checking $ruta\n";
    $contenido = file_get_contents($ruta);

    // Verifica si la etiqueta </head> está presente
    if (strpos($contenido, '</head>') !== false && strpos($contenido, 'G-T7XEVFZK6N') === false) {
        // Agrega el código de Google Analytics antes de la etiqueta </head>
        $codigoAnalytics = "
            <script src=\"https://www.googletagmanager.com/gtag/js?id=G-T7XEVFZK6N\"></script>
            <script>
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-T7XEVFZK6N');
            </script>
        ";

        $contenido = str_replace('</head>', $codigoAnalytics . '</head>', $contenido);
        echo "[INFO] ... adding gtag to $ruta\n";
        // Guarda el archivo modificado
        file_put_contents($ruta, $contenido);
    }
}
/*
function agregarSufijoTitulo($ruta)
{
    echo "[INFO] Checking title of $ruta\n";
    $contenido = file_get_contents($ruta);

    // Verifica si la etiqueta </title> está presente
    if (strpos($contenido, '</title>') !== false && strpos($contenido, ' | rafageist</title>') === false) {
        // Agrega el sufijo al título
        $contenido = str_replace('</title>', ' | rafageist</title>', $contenido);

        // Guarda el archivo modificado
        file_put_contents($ruta, $contenido);
    }
}
*/
function explorarDirectorio($directorio)
{
    echo "[INFO] Exploring $directorio\n";
    $archivos = scandir($directorio);

    foreach ($archivos as $archivo) {
        if ($archivo == '.' || $archivo == '..') {
            continue;
        }

        $ruta = $directorio . '/' . $archivo;

        if (is_dir($ruta)) {
            // Si es un directorio, explóralo recursivamente
            explorarDirectorio($ruta);
        } elseif (pathinfo($ruta)['extension'] == 'html') {
            $tpl = new div($ruta, [
                "nocache" => uniqid(),
                "sitename" => "rafageist"
            ]);
            
            file_put_contents($ruta, "$tpl");
            // Si es un archivo HTML, agrega Google Analytics
            //agregarGoogleAnalytics($ruta);
            //agregarSufijoTitulo($ruta);
        }
    }
}

// Ruta del directorio a explorar (ajústala según tu estructura de carpetas)
$directorioBase = __DIR__ . '/public';

explorarDirectorio($directorioBase);

echo "Proceso completado.";
