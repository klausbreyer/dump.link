#!/bin/bash

# Execute the curl command and capture the output
response=$(curl --location 'http://localhost:8080/api/v1/projects' \
--header 'Origin: http://localhost:1234' \
--header 'Username: postman username x' \
--header 'Content-Type: application/json' \
--data-raw '{ "name": "Tasty Intelligent Granite Chicken", "appetite": 3, "ownerEmail": "Kenyon8@hotmail.com", "ownerFirstName": "Garth", "ownerLastName": "Schultz" } ')

# Extract the project ID from the response
project_id=$(echo $response | grep -o '"id":"[^"]*' | cut -d'"' -f4)

# Output the URL
echo "http://localhost:1234/a/p/$project_id"
