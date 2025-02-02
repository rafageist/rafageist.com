---
date: 2024-01-01
lang: en
icon: IbDocument
---

#Blog #PHP #GoodPractices
## Introduction

In software development, especially in projects involving extensive code and collaboration among several developers, good organization of folders and files is crucial. In PHP, where projects can often start as simple scripts and grow in complexity, defining a clear structure from the beginning is essential for maintaining scalability and maintainability. This article explores various ways to structure PHP projects without relying on specific frameworks, using Composer for third-party package management.

## 1. Model-View-Controller (MVC)

```
project-root/
|-- assets/ # CSS, images, JavaScripts, etc.
|-- app/
| |-- Controllers/ # Controllers
| |-- Models/ # Models
| |-- Views/ # Views
|-- config/ # Configurations
|-- public/ # Publicly accessible folder
| |-- index.php # Entry point
|-- lib/ # Libraries and helpers
|-- logs/ # Log files
|-- tests/ # Tests
|-- vendor/ # Composer dependencies
```
### Description
The Model-View-Controller (MVC) pattern is one of the most common approaches in web development. In this pattern, `Model` represents business logic and data manipulation, `View` is responsible for presenting information to the user, and `Controller` acts as an intermediary between Model and View, managing user input and system responses.

### Advantages
- **Clear separation of responsibilities**: Each component has a clear responsibility, which facilitates the organization of the code and its subsequent maintenance.
- **Ease of management**: It is easier for new developers to understand the structure of the project and quickly find the necessary files.

### Disadvantages
- **Rigidity**: For very large projects, the MVC pattern can become rigid and less efficient, especially if the models are very interdependent.
- **Code duplication**: There can be duplication of code, especially in views that share common elements.

## 2. Module-Based Organization

```
project-root/
|-- assets/
|-- modules/ # Independent modules
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
### Description
In module-based organization, the project is divided into several independent modules, each with its own set of views, controllers, and models. This allows work on one module without directly affecting others.

### Advantages
- **Encapsulation**: Improves the modularity of the project, making each module independent and easy to update or modify.
- **Scalability**: It is easier to add new functionalities as independent modules without altering the operation of existing modules.

### Disadvantages
- **Complexity**: It can be challenging for new developers to understand how different modules interact.
- **Initial planning**: Requires good planning to avoid unwanted interdependencies between modules.

## 3. Domain-Driven Design (DDD)

```
project-root/
|-- assets/
|-- src/
| |-- Domain/ # Domain entities and logic
| | |-- User/
| | | |-- User.php # User entity
| | | |-- UserRepository.php
| | |-- Product/
| | |-- Product.php
| | |-- ProductRepository.php
| |-- Application/ # Use cases, commands, events
| |-- Infrastructure/ # Data access implementation, email, etc.
|-- config/
|-- public/
| |-- index.php
|-- lib/
|-- logs/
|-- tests/
|-- vendor/
```
### Description
Domain-Driven Design (DDD) is an approach that focuses on the complexity of applications and their domains. The project structure closely aligns with the business domain, integrating business logic and rules into the architecture.

### Advantages
- **Cohesion**: High cohesion by organizing code around domain entities.
- **Collaboration**: Facilitates collaboration between developers and domain experts by accurately reflecting business needs.

### Disadvantages
- **Learning curve**: Requires a deep understanding of the domain, which can be a barrier for new developers.
- **Architecture complexity**: Can result in a more complex structure, especially if the domain itself is complex.

## Conclusion

Choosing a folder structure for PHP projects should be based on various factors, including the nature of the project, the size of the development team, and long-term growth perspectives. Each approach has its advantages and limitations, and the best choice will depend on the specific needs of the project and the team.
## References

- [PHP: The Right Way](https://phptherightway.com/)
- [SitePoint PDS Skeleton](https://www.sitepoint.com/pds-skeleton-2017/)
- [Stack Overflow PHP Structure](https://stackoverflow.com/questions/11939226/php-directory-structure-best-practices)
- [PHP.Earth Directory Structure](https://docs.php.earth/docs/php/structure.html)
- [Composer Official Site](https://getcomposer.org/)

---
- [ ] Spanish version: [[Enfoques y Prácticas para estructurar proyectos PHP sin Frameworks]]
