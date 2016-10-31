#!/bin/bash
yarn build && \
    cf push "cognitive-bartender2" -c "node dist/index.js"
