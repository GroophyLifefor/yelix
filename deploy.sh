#!/bin/bash

confirm_and_execute() {
    local prompt=$1
    local command=$2
    local allow_skip=${3:-false}  # Optional parameter for allowing 'n' without exit

    while true; do
        read -p "$prompt (y/n/kill): " answer
        case $answer in
            [Yy])
                echo "$ $command"
                eval "$command"
                break ;;
            [Nn])
                if [ "$allow_skip" = true ]; then
                    break
                else
                    exit 0
                fi ;;
            kill) exit 0 ;;
            *) continue ;;
        esac
    done
}

echo "TESTING, I know no one likes to test, but it's important"
confirm_and_execute "TESTING - Can I continue?" "deno task test"

echo "---"
echo "FMT, fmt does not only make your code look good, but also make it easier to read"
confirm_and_execute "FMT - Can I continue?" "deno fmt"

echo "---"
echo "LINT, it helps you to find errors in your code"
confirm_and_execute "LINT - Can I continue?" "deno lint"

echo "---"
echo "BUILD, it's time to build your project"
confirm_and_execute "BUILD - Can I continue?" "deno publish --dry-run --allow-dirty"

echo "---"
echo "(p)atch, (m)inor, major, (n)one, kill"
read -p "Enter majority (p/m/major/n/kill): " majority

case $majority in
    p) majority="patch" ;;
    m) majority="minor" ;;
    major) majority="major" ;;
    n) majority="none" ;;
    kill) exit 0 ;;
esac

if [ "$majority" != "none" ]; then
    deno task "bump:$majority"
fi

echo "---"
confirm_and_execute "GIT ADD - Can I continue?" "git add ."

echo "---"
confirm_and_execute "GIT COMMIT - Can I continue?" "git-commit"

echo "---"
echo "AGAIN BUILD AFTER COMMIT, it's time to build your project"
confirm_and_execute "BUILD - Can I continue?" "deno publish --dry-run"

echo "---"
confirm_and_execute "Will pushed?" "git push" true

echo "---"
echo "DONE"
