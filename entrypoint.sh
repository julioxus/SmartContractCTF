#!/bin/bash

truffle compile
truffle migrate --reset
mv build/contracts/*.json src/artifacts/
cp -r /app/src /usr/local/apache2/htdocs/
/usr/sbin/apache2ctl -D FOREGROUND
