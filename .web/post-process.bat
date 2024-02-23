php post-process.php
xcopy .\.dev\rafageist.png .\public\rafageist.png /y
cd ..
git add --all
git commit -m "update"
git push origin master


