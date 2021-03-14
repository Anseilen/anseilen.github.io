#!/bin/bash

ls assets/js | xargs -I{} echo {} | cut -f 1 -d . | xargs -I% uglifyjs assets/js/%.js -c -m -o assets/js/dist/%.min.js