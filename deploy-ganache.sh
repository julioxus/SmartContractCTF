#!/bin/bash

truffle compile
truffle migrate --reset --network ganache
mv build/contracts/*.json src/artifacts/
