@echo off

echo.
echo ------------------------------
echo TESTING, I know no one likes to test, but it's important
echo $ deno task test
deno task test
:testing_question
set /p test="TESTING - Can I continue? (y/n/kill): "
if "%test%"=="y" goto testing_continue
if "%test%"=="n" goto end
if "%test%"=="kill" goto end
goto testing_question
:testing_continue
echo ------------------------------

echo.
echo ------------------------------
echo FMT, fmt does not only make your code look good, but also make it easier to read
echo $ deno fmt
deno fmt
:fmt_question
set /p fmt="FMT - Can I continue? (y/n/kill): "
if "%fmt%"=="y" goto fmt_continue
if "%fmt%"=="n" goto end
if "%fmt%"=="kill" goto end
goto fmt_question
:fmt_continue
echo ------------------------------

echo.
echo ------------------------------
echo LINT, it helps you to find errors in your code
echo $ deno lint
deno lint
:lint_question
set /p lint="LINT - Can I continue? (y/n/kill): "
if "%lint%"=="y" goto lint_continue
if "%lint%"=="n" goto end
if "%lint%"=="kill" goto end
goto lint_question
:lint_continue
echo ------------------------------

echo.
echo ------------------------------
REM get majority, '(p)atch', '(m)inor', 'major', '(n)one'
echo (p)atch, (m)inor, major, (n)one, kill
set /p majority="Enter majority (p/m/major/n/kill): "
if "%majority%"=="p" set majority=patch
if "%majority%"=="m" set majority=minor
if "%majority%"=="major" set majority=major
if "%majority%"=="n" set majority=none
if "%majority%"=="kill" goto end

if not "%majority%"=="none" (
  deno task bump:%majority%
)
echo ------------------------------

echo.
echo ------------------------------
echo $ git add .
git add .
:git_add_question
set /p git_add="GIT ADD - Can I continue? (y/n/kill): "
if "%git_add%"=="y" goto git_add_continue
if "%git_add%"=="n" goto end
if "%git_add%"=="kill" goto end
goto git_add_question
:git_add_continue
echo ------------------------------

echo.
echo ------------------------------
echo $ git-commit
call git-commit
:git_commit_question
set /p git_commit="GIT COMMIT - Can I continue? (y/n/kill): "
if "%git_commit%"=="y" goto git_commit_continue
if "%git_commit%"=="n" goto end
if "%git_commit%"=="kill" goto end
goto git_commit_question
:git_commit_continue
echo ------------------------------

echo.
echo ------------------------------
echo BUILD, it's time to build your project
echo $ deno publish  --dry-run
deno publish --dry-run
:build_question
set /p build="BUILD - Can I continue? (y/n): "
if "%build%"=="y" goto build_continue
if "%build%"=="n" goto end
goto build_question
:build_continue
echo ------------------------------

echo.
echo ------------------------------
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
echo ------------------------------
echo.
echo -- DONE --
echo.