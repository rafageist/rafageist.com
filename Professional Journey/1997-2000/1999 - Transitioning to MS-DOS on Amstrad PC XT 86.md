![[Amstrad XT 86.png]]

In the evolving landscape of 1999, my programming odyssey took a leap forward with the transition to the Amstrad PC XT 86. Adorned with CGA and EGA monitors, this platform not only expanded the visual dimensions of my coding environment but also marked the continued embrace of MS-DOS.

Enter Microsoft's QuickBASIC—a revolutionary shift in my programming toolkit. QuickBASIC surpassed its predecessors with a sophisticated editor and environment that redefined my coding experience. Debugging became more intuitive, and the inclusion of a modern text editor, mouse support, dropdown menus, and dialog boxes elevated the programming process.

The introduction of a Immediate Window allowed for on-the-fly execution of BASIC instructions, adding a dynamic layer to code development. This era of MS-DOS, Amstrad PC XT 86, and QuickBASIC brought about a convergence of efficiency and modernity, laying the groundwork for more intricate coding projects and setting a new standard for my programming endeavors.

![[QuickBasic.png]]

# Pioneering with QuickBASIC: Formative Projects 

Fast forward to the late '90s and early 2000s, a significant chapter in my programming chronicles unfolded as I immersed myself in QuickBASIC on the Amstrad PC XT 86. Over an extensive period of nearly 3 to 4 years, I devoted my efforts to three pivotal projects that laid the foundation for my formative years as a developer.

1. **Replica of Carmen Sandiego Game:** Building upon my earlier Mallard BASIC endeavor, I recreated the Carmen Sandiego game in QuickBASIC. This project not only showcased my evolving programming skills but also demonstrated my commitment to pushing boundaries and refining my craft.
    
2. **Student Database Management System:** A robust system for managing student databases in schools emerged from my coding endeavors. This project delved into the complexities of data organization and manipulation, offering practical solutions for educational institutions.
    
3. **Warehouse Inventory System:** With an eye for efficiency, I developed a comprehensive inventory management system for warehouses. This project not only streamlined logistical processes but also honed my ability to create practical solutions tailored to specific needs.
    

These ventures, all accomplished in the text-mode environment of QuickBASIC, not only provided practical solutions but also served as a playground for refining my coding skills. The commitment to these projects and the hands-on experience with QuickBASIC became the crucible in which my passion for software development solidified, setting the stage for the next chapters of my programming journey.

# Lost in Code: A Journey to Recreate

In the ever-evolving landscape of programming, some gems of code and creativity are, unfortunately, lost to the sands of time. Such is the case with a collection of early QuickBASIC programs that once adorned the screens of my coding endeavors.

These programs, born from a fusion of passion and exploration, represented pivotal moments in my journey as a developer. From ASCII artistry to windowed wonders, each line of code told a story of innovation and learning.

Regrettably, the original source codes of these creations have slipped through the cracks of time. However, the spirit and lessons learned from those coding adventures remain vibrant and alive. In an effort to preserve and share a glimpse of that journey, I embark on a mission to recreate fragments of these lost programs.

Throughout this website, you'll find snippets, reimaginings, and glimpses into the past. While the exact codes may be lost, the essence of the projects will be revived, offering a nod to the early days of exploration and coding enthusiasm.

Join me on this digital archaeology expedition as we resurrect fragments of the past, celebrating the resilience of creativity and the enduring spirit of a programmer's journey.
# Crafting ASCII Artistry: Building Tools for Creative Development

In the pursuit of my formative projects with QuickBASIC, I found myself not just coding solutions but crafting the very tools that fueled my creative endeavors. One of the significant contributions to this period was the development of a library designed for creating graphical components in ASCII mode. This versatile library allowed the creation of windows, dropdown menus, controlled text input, buttons, and even shaded elements—all within the constraints of a 25x80 character screen with 32 available colors and the expansive canvas of ASCII's 255 characters.

```basic
SUB Window(row, col, width, height, fgColor, bgColor)
    ' Set foreground and background colors
    COLOR bgColor, fgColor

    ' ASCII characters for borders
    DIM SHARED borderChars(3)
    borderChars(1) = 218 ' ┌
    borderChars(2) = 191 ' ┐
    borderChars(3) = 196 ' ─

    ' Draw top-left corner
    LOCATE row, col
    PRINT CHR$(borderChars(1));

    ' Draw top-right corner
    LOCATE row, col + width - 1
    PRINT CHR$(borderChars(2));

    ' Draw top border
    FOR i = 1 TO width - 3
        LOCATE row, col + i
        PRINT CHR$(borderChars(3));
    NEXT i

    ' Draw vertical sides
    FOR i = 1 TO height - 2
        LOCATE row + i, col
        PRINT CHR$(179); ' │
        LOCATE row + i, col + width - 1
        PRINT CHR$(179);
    NEXT i

    ' Draw bottom-left corner
    LOCATE row + height - 1, col
    PRINT CHR$(192); ' └

    ' Draw bottom-right corner
    LOCATE row + height - 1, col + width - 1
    PRINT CHR$(217); ' ┘

    ' Restore default colors
    COLOR 7, 0
END SUB
```

' Example of using the Window subroutine
```basic
CLS
CALL Window(5, 10, 30, 10, 12, 1)  ' Draw a window at position (5, 10), width 30, height 10, colors 12 and 1
```

Among the notable achievements was the construction of a program dedicated to "painting in ASCII." This tool went beyond the conventional boundaries, enabling the creation, saving, and loading of ASCII-based artwork. What set this tool apart was its ability to compress the saved artwork, a feat achieved by intelligently storing repetitive characters and colors. Similar characters and colors were efficiently stored as references, minimizing the bytes required to represent these ASCII images. This compression technique not only conserved storage but also paved the way for intricate and visually captivating projects, enhancing the efficiency of the creative process and leaving a lasting imprint on my programming journey.

