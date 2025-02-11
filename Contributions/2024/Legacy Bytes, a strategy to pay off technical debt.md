---
title: Legacy Bytes, a strategy to pay off technical debt
icon: IbDocumentText
---

![[Legacy bytes.png]]
Technical debt is a recurring concept in software development, but it is not always easy to identify and even less clear how to define a strategy to tackle it. In this article, we will explore how to detect technical debt, the steps to address it, and the importance of measuring our progress with a strategy based on "legacy bytes".

## When Does Technical Debt Exist?

The first step in dealing with technical debt is to detect its symptoms. Technical debt is not always evident, but certain signs indicate its presence. These signs include code that is difficult to understand, functionalities that are hard to modify without causing errors, outdated architectures, or designs that no longer adhere to best practices. In short, any part of the software that creates difficulties, risks, or high costs when attempting to make changes can be considered technical debt.

## Inventory and Definition of the Objective

Once we have identified the symptoms, the next step is to understand what has been done and how it is implemented. This means taking an inventory of the current system: analyzing the code, architecture, dependencies, and any other relevant pieces. This inventory is crucial to understanding the terrain we need to navigate. Then, we must define the ideal target, whether it is a new design, a renewed architecture, or a cleaner and more modular code structure. This definition must be concrete and physically represented in a new part of the project or even in a parallel project.

## Measuring Technical Debt with "Legacy Bytes"

To measure the progress of addressing technical debt, I propose using a metric called "legacy bytes". The idea is to measure how many bytes of the inherited system remain as we advance in the refactoring process. This includes not only code but also resources, assets, configurations, etc., excluding third-party frameworks and libraries. Although other indicators could be used, such as the number of files, classes, or methods, I prefer bytes because technical debt can manifest in many forms—from unnecessary keywords to poorly used operators. We could even measure the size of files in bytes, as every detail counts when it comes to technical debt.

## The Remanufacturing Strategy

There are several ways to tackle technical debt: we could start from scratch, patch the code, refactor parts, or use what I call "remanufacturing", which is the strategy I propose. This strategy involves gradually moving code from the legacy project to the new structure. It is not about copying and pasting but about moving code to its new place in an organized way, applying refactoring and improvements at each step. This involves adopting best practices, such as following SOLID principles (which include the separation of responsibilities) and ensuring automated tests for every change.

Each movement involves constant testing and the iterative release of improved versions. It is important to emphasize that this process is physical: the code is moved from one structure to another, which may require temporary implementations to keep the system running. This is similar to what happens in many labor jobs, such as construction or plumbing, where an old part of the structure is sometimes abandoned or destroyed and replaced with a new one, although the old one may still be used temporarily until it is no longer needed. In this context, it is important to distinguish between patching, refactoring, and remanufacturing: a patch is generally a piece of code added to make something work; refactoring involves modifying an existing part of the code to improve it without changing its functionality; while remanufacturing is like a version from scratch but done gradually and can coexist with the old code if necessary. By moving and transforming the code, we also test whether the new design is viable and works in practice, something that is not as easy if we decide to rebuild everything from scratch.

## Measuring Progress and Team Collaboration

As we move the code, we measure the size of the remaining legacy code and compare it to the original size. This gives us a quantitative measure of the progress made and how much work remains to be done.

Team collaboration is essential in this process. This includes documenting each advance, holding regular meetings to discuss progress, and ensuring that each piece moved or refactored is well-tested. Involving the most experienced team members and ensuring they lead the process is also key to making the transition with the proper knowledge and without risking the system's functionality.

## Conclusions

Tackling technical debt is not an easy task, but with a well-defined strategy and a remanufacturing approach, it is possible to move forward in an orderly manner, minimizing risks, and ensuring that each step has a positive impact. Moving code consciously, measuring progress, and working collaboratively allows us to improve our systems without needing to start from scratch. Ultimately, it is about working with what we have, improving it, and making it sustainable in the long term.
