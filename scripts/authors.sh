#!/bin/sh
# Generate an AUTHORS file based on the output of git shortlog

{
	echo "# Authors"
	echo "On *$(date +%d/%m/%Y)*:"
	echo ""
	git shortlog -se \
    	| sed -E "s/^\s+[0-9]+\s+(.*)/\1/" \
    	| sed -E "s/^(.*)\s<(.*)>/**\1** <*\2*>/"
} > AUTHORS.md
