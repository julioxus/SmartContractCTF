#!/bin/bash

truffle compile
truffle migrate --reset --network ropsten
mv build/contracts/*.json src/artifacts/
