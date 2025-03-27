#!/bin/bash

# Directly source the .env.local file - much simpler approach
set -a # automatically export all variables
. ./.env.local
set +a

# Show what was exported
env | grep -E 'NEXT_PUBLIC_|DATABASE_URL|GOOGLE_|NEXTAUTH_' 