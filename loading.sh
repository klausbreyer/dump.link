#!/bin/bash

# Use environment variables for database credentials
DB_USER="${DB_USER}"
DB_PASS="${DB_PASS}"
DB_HOST="${DB_HOST}"
DB_NAME="${DB_NAME}"

# Connect to the database and set the character set
mysql -u "$DB_USER" -p"$DB_PASS" -h "$DB_HOST" "$DB_NAME" -e "SET NAMES 'utf8mb4';"

# Define the order of tables
TABLES=("projects" "buckets" "tasks" "dependencies" "activities")

# Load the tables in the defined order
for table in "${TABLES[@]}"; do
    mysql -u "$DB_USER" -p"$DB_PASS" -h "$DB_HOST" "$DB_NAME" < "./pscale-dump/dumplink.$table-schema.sql"
    mysql -u "$DB_USER" -p"$DB_PASS" -h "$DB_HOST" "$DB_NAME" < "./pscale-dump/dumplink.$table.00001.sql"
done

# Load the rest of the files that are not in the list
for file in ./pscale-dump/*.sql; do
    skip=0
    for table in "${TABLES[@]}"; do
        if [[ "$file" == *"$table-schema.sql" || "$file" == *"$table.00001.sql" ]]; then
            skip=1
            break
        fi
    done
    if [ "$skip" -eq 0 ]; then
        mysql -u "$DB_USER" -p"$DB_PASS" -h "$DB_HOST" "$DB_NAME" < "$file"
    fi
done
