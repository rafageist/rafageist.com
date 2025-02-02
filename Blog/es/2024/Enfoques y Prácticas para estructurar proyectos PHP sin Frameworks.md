---
date: 2024-01-01
lang: es
icon: IbDocument
aliases:
  - Structuring PHP Projects - Approaches and Practices without Frameworks
---

#Blog #PHP #GoodPractices 

## Introducción

En el desarrollo de software, especialmente en proyectos que involucran código extenso y colaboración entre varios desarrolladores, una buena organización de carpetas y archivos es crucial. En PHP, donde los proyectos pueden comenzar como simples scripts y aumentar en complejidad, definir una estructura clara desde el principio es esencial para mantener la escalabilidad y la mantenibilidad. Este artículo explora varias formas de estructurar proyectos PHP sin depender de frameworks específicos, utilizando Composer para la gestión de paquetes de terceros.

## 1. Modelo-Vista-Controlador (MVC)

```
project-root/
|-- assets/ # CSS, imágenes, JavaScripts, etc.
|-- app/
| |-- Controllers/ # Controladores
| |-- Models/ # Modelos
| |-- Views/ # Vistas
|-- config/ # Configuraciones
|-- public/ # Carpeta pública accesible
| |-- index.php # Punto de entrada
|-- lib/ # Bibliotecas y helpers
|-- logs/ # Archivos de log
|-- tests/ # Pruebas
|-- vendor/ # Dependencias de Composer
```
### Descripción
El patrón Modelo-Vista-Controlador (MVC) es uno de los enfoques más comunes en el desarrollo web. En este patrón, `Modelo` representa la lógica de negocio y la manipulación de datos, `Vista` se encarga de presentar información al usuario y `Controlador` actúa como intermediario entre el Modelo y la Vista, gestionando la entrada del usuario y las respuestas del sistema.

### Ventajas
- **Separación clara de responsabilidades**: Cada componente tiene una responsabilidad clara, lo que facilita la organización del código y su mantenimiento posterior.
- **Facilidad de manejo**: Es más fácil para los desarrolladores nuevos entender la estructura del proyecto y encontrar rápidamente los archivos necesarios.

### Desventajas
- **Rigidez**: Para proyectos muy grandes, el patrón MVC puede volverse rígido y menos eficiente, especialmente si los modelos son muy interdependientes.
- **Duplicación de código**: Puede ocurrir duplicación de código, especialmente en las vistas que comparten elementos comunes.

## 2. Organización Basada en Módulos

```
project-root/
|-- assets/
|-- modules/ # Módulos independientes
| |-- User/
| | |-- Controllers/
| | |-- Models/
| | |-- Views/
| |-- Product/
| |-- Controllers/
| |-- Models/
| |-- Views/
|-- config/
|-- public/
| |-- index.php
|-- lib/
|-- logs/
|-- tests/
|-- vendor/
```
### Descripción
En la organización basada en módulos, el proyecto se divide en varios módulos independientes, cada uno con su propio conjunto de vistas, controladores y modelos. Esto permite trabajar en un módulo sin afectar directamente a los demás.

### Ventajas
- **Encapsulamiento**: Mejora la modularidad del proyecto, haciendo que cada módulo sea independiente y fácil de actualizar o modificar.
- **Escalabilidad**: Es más fácil añadir nuevas funcionalidades como módulos independientes sin alterar el funcionamiento de los módulos existentes.

### Desventajas
- **Complejidad**: Puede ser desafiante para los desarrolladores nuevos comprender cómo interactúan los diferentes módulos.
- **Planificación inicial**: Requiere una buena planificación para evitar interdependencias no deseadas entre módulos.

## 3. Diseño Dirigido por el Dominio (DDD)

```
project-root/
|-- assets/
|-- src/
| |-- Domain/ # Entidades y lógica de dominio
| | |-- User/
| | | |-- User.php # Entidad usuario
| | | |-- UserRepository.php
| | |-- Product/
| | |-- Product.php
| | |-- ProductRepository.php
| |-- Application/ # Casos de uso, comandos, eventos
| |-- Infrastructure/ # Implementación de acceso a datos, correo, etc.
|-- config/
|-- public/
| |-- index.php
|-- lib/
|-- logs/
|-- tests/
|-- vendor/
```
### Descripción
El Diseño Dirigido por el Dominio (DDD) es un enfoque que se centra en la complejidad de las aplicaciones y sus dominios. La estructura del proyecto se alinea estrechamente con el dominio del negocio, integrando la lógica y las reglas de negocio en la arquitectura.

### Ventajas
- **Cohesión**: Alta cohesión al organizar el código alrededor de las entidades del dominio.
- **Colaboración**: Facilita la colaboración entre los desarrolladores y los expertos del dominio al reflejar fielmente las necesidades del negocio.

### Desventajas
- **Curva de aprendizaje**: Requiere un entendimiento profundo del dominio, lo que puede ser una barrera para los desarrolladores nuevos.
- **Complejidad de la arquitectura**: Puede resultar en una estructura más compleja, especialmente si el dominio es en sí mismo complejo.

## Conclusión

La elección de una estructura de carpetas para proyectos PHP debe basarse en varios factores, incluyendo la naturaleza del proyecto, el tamaño del equipo de desarrollo y las perspectivas de crecimiento a largo plazo. Cada enfoque tiene sus ventajas y limitaciones, y la mejor elección dependerá de las necesidades específicas del proyecto y del equipo.

## Referencias

- [PHP: The Right Way](https://phptherightway.com/)
- [SitePoint PDS Skeleton](https://www.sitepoint.com/pds-skeleton-2017/)
- [Stack Overflow PHP Structure](https://stackoverflow.com/questions/11939226/php-directory-structure-best-practices)
- [PHP.Earth Directory Structure](https://docs.php.earth/docs/php/structure.html)
- [Composer Official Site](https://getcomposer.org/)

---
- [x] English version: [[Structuring PHP Projects - Approaches and Practices without Frameworks]]
