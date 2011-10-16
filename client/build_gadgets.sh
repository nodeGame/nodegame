#!/bin/bash

NAME="nodegame-gadgets"
VERSION="0.3.1"


BUILD="./releases/"

# Check if a particular sub-directory for build was required
if [ "$#" -eq 1 ]
	then
	# Create Directory if it does not exist
	if [ ! -d $BUILD$1 ]	
		then
		`mkdir $BUILD$1`
		echo "Created directory:" $BUILD$1
	fi
	BUILD=$BUILD$1"/"
fi

EXT=".js"
MIN="-min"

NODEGAME=$BUILD$NAME"-"$VERSION$EXT
NODEGAMEMIN=$BUILD$NAME$MIN"-"$VERSION$EXT

DATE=`eval date` #+%Y%m%d`
AUTHOR="Copyright 2011, Stefano Balietti"


# Custom Funcs

function addBlanks {
	
	COUNT=$1
 	FILE=$2
	
	while [ $COUNT -gt 0 ]; do
		echo " " >> $FILE
		let COUNT=COUNT-1
	done 
}


# Init the file

echo "/*!" > $NODEGAME
echo " * nodeGadgets v$VERSION" >> $NODEGAME
echo " * http://nodegame.org" >> $NODEGAME
echo " *" >> $NODEGAME
echo " *" $AUTHOR >> $NODEGAME
echo " *" >> $NODEGAME
echo " * Built on" $DATE >> $NODEGAME
echo " *" >> $NODEGAME
echo " */" >> $NODEGAME
addBlanks 2 $NODEGAME


# Add all the classes

FILES="../gadgets/*"

for f in $FILES	; do

	if [ -f "$f" ]
	then
    EXT1=${f##*.}
		if [ ${f##*.} == "js" ]
			then
			echo "Processing $f file..."
				`cat $f >> $NODEGAME`
				addBlanks 4 $NODEGAME
		 	fi
		fi

done

`chmod +x $NODEGAME`

echo $NODEGAME created succesfully.

# Producing a minified version as well
# exec yui $NODEGAME -o $NODEGAMEMIN   --charset=utf-8


