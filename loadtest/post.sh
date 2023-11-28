#!/bin/bash
while true; do
  # Generiere einen zufälligen String und kürze ihn auf 22 Zeichen
  random_id=$(openssl rand -base64 30 | tr -d '=/+' | cut -c 1-22)

  # Führe den CURL-Befehl mit der zufälligen ID aus
  curl 'https://dump.link/api/v1/projects/9FsN7nZSpMZ/tasks?token=2023-11-28T12%3A06%3A30.146Z1U7PyT2Lq3e' \
       -X POST -H 'Content-Type: application/json' \
       --data-raw "{\"id\":\"${random_id}\",\"priority\":200000,\"title\":\"another\",\"closed\":false,\"bucketId\":\"9FsN7nZSpMZCiqTjJCFQPa\"}" &
  sleep 0.1
done
