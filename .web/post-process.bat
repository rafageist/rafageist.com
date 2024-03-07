php post-process.php
xcopy .\.dev\rafageist.jpg .\public\rafageist.jpg /y
cd ..
git add --all
git commit -m "update"
git push origin master
pause