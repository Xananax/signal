#!/usr/bin/env bash
# vi:syntax=sh

FILE=todo.md
rm -f $FILE

echo "# Todo" > $FILE

function print () {
	echo "$1" >> $FILE
}

function title () {
	print ""
	print "----"
	print ""
	print "## $1"
	print ""
}

title "Tests"
grep -r 'skip' --include="*.test.ts" ./src/utils | \
sed 's/\/[a-zA-Z]\+\.test\.ts:.\{0,100\}//' | \
sed 's/^\.\/src\// - /' \
>> $FILE

title "Readmes"
find ./src/utils -name '*.md' | \
xargs wc -l | \
sed -n '/^    [0-3]/p' | \
sed -e 's/^    [0-3] \.\/src\// - /' | \
sed -e 's/\/readme\.md//' \
>> $FILE