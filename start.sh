#!/bin/bash
npm run pb:start &
sleep 5
# npm run setup
npm run build
npm run preview