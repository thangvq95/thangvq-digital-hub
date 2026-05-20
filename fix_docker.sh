#!/bin/bash
sed -i 's/- ~\/.ssh:\/root\/.ssh:ro//g' infra/docker-compose.yml
