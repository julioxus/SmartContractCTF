#!/bin/bash

truffle compile
truffle migrate --reset
mv build/contracts/*.json src/artifacts/
#/etc/init.d/apache2 start
/usr/sbin/apache2ctl -D FOREGROUND
