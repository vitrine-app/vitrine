#!/bin/bash
# Generate an AUTHORS file based on the output of git shortlog

date=$(date +%d/%m/%Y)
echo "# Authors" > ../AUTHORS.md
echo "On *$date*:" >> ../AUTHORS.md
echo "" >> ../AUTHORS.md
git shortlog -se \
	| sed -E 's/^\s+[0-9]+\s+(.*)/\1/' \
	| sed -E 's/^(.*)\s<(.*)>/**\1** <*\2*>/' \
	>> ../AUTHORS.md
