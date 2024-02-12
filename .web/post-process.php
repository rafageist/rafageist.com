<?php

function agregarGoogleAnalytics($ruta) {
    $contenido = file_get_contents($ruta);

    // Verifica si la etiqueta </head> está presente
    if (strpos($contenido, '</head>') !== false) {
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

        // Guarda el archivo modificado
        file_put_contents($ruta, $contenido);
    }
}

function explorarDirectorio($directorio) {
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
            // Si es un archivo HTML, agrega Google Analytics
            agregarGoogleAnalytics($ruta);
        }
    }
}

// Ruta del directorio a explorar (ajústala según tu estructura de carpetas)
$directorioBase = __DIR__ . '/public';

explorarDirectorio($directorioBase);

echo "Proceso completado.";
