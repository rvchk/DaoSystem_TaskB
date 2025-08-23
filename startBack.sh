cd fabric-samples/test-network

./network.sh down

./network.sh up -ca
./network.sh createChannel -c blockchain2025

cd ../../chaincode
npm install

cd ../fabric-samples/test-network
./network.sh deployCC -ccn dao-system -ccl javascript -ccp ../../chaincode -c blockchain2025 -cci InitLedger

cd ../../application
rm -rf "wallet"
npm install
npm run dev