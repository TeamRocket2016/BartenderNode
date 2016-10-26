#!/bin/bash
yarn build && \
    cf push "cognitive-bartender" -c "node dist/index.js"
