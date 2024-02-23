php post-process.php
xcopy .\.dev\rafageist.png .\public\rafageist.png /y
git add --all
git commit -m "update"
git push origin master


