@echo off
REM get majority, '(p)atch', '(m)inor', 'major', '(n)one'
echo (p)atch, (m)inor, major, (n)one
set /p majority="Enter majority (p/m/major/n): "
if "%majority%"=="p" set majority=patch
if "%majority%"=="m" set majority=minor
if "%majority%"=="major" set majority=major
if "%majority%"=="n" set majority=none

if not "%majority%"=="none" (
  deno task bump:%majority%
)

echo $ git add .
git add .

echo $ git-commit
call git-commit

:willpushed
set /p willpushed="Will pushed? (y/n): "
if "%willpushed%"=="y" goto pushed
if "%willpushed%"=="n" goto end
goto willpushed

:pushed
echo $ git push
git push
goto end

:end
echo DONE