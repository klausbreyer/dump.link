#!/bin/bash

# Path to the source directory
source_dir="app/dist"

# Path to the destination directory
destination_dir="api/static/app"

# Remove the contents of the destination directory, but not the directory itself
rm -rf $destination_dir/*
echo "Cleared the contents of the destination directory."

# Find and copy the CSS file along with its source map
css_file=$(find $source_dir -name '*.css')
css_map_file=$(find $source_dir -name '*.css.map')
cp $css_file $destination_dir/
cp $css_map_file $destination_dir/
echo "Copied CSS file and its source map."

# Find and copy the JS file along with its source map
js_file=$(find $source_dir -name '*.js')
js_map_file=$(find $source_dir -name '*.js.map')
cp $js_file $destination_dir/
cp $js_map_file $destination_dir/
echo "Copied JS file and its source map."

echo "Content of the target directory has been deleted and new files have been copied."
