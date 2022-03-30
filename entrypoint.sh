#!/bin/bash

truffle compile
truffle migrate --reset
mv build/contracts/*.json src/artifacts/
/usr/sbin/apache2ctl -D FOREGROUND
