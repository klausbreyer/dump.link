#!/bin/bash

# Path to the source directory
source_dir="app/dist"

# Path to the destination directory
destination_dir="api/static/app"

# Remove the contents of the destination directory, but not the directory itself
rm -rf $destination_dir/*
echo "Cleared the contents of the destination directory."

# Find and copy the CSS file
css_file=$(find $source_dir -name '*.css')
cp $css_file $destination_dir/
echo "Copied CSS file."

# Find and copy the JS file
js_file=$(find $source_dir -name '*.js')
cp $js_file $destination_dir/
echo "Copied JS file."

echo "Content of the target directory has been deleted and new files have been copied."
