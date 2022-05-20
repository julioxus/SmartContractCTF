truffle compile
truffle migrate --reset --network ganache
Remove-Item .\src\artifacts\*.json
Move-Item -Path .\build\contracts\*.json -Destination .\src\artifacts\
