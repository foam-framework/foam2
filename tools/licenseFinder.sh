#!/bin/bash

# Finds files not starting with /** & don't have the extensions
# of .DS_Store, .md, .txt, .html. Searches in src/foam/*

for i in `grep -rL "/\*\*" ../src/foam/*`; do
   if [[ ${i} != *".DS_Store"* && ${i} != *".md" && ${i} != *".txt" && ${i} != *".html" ]];then
    echo "$i"
   fi
done

