#!/bin/bash

truffle compile
truffle migrate --reset --network ganache
mv build/contracts/*.json src/artifacts/
cp -r /app/src/* /var/www/html/
/usr/sbin/apache2ctl -D FOREGROUND
