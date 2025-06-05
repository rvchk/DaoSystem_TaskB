cd fabric-samples

cd test-network

./network.sh down

./network.sh up createChannel -c blockchain2025 -ca

cd ../../chaincode
npm install

cd ../fabric-samples/test-network
./network.sh deployCC -ccn save-traffic-system -ccl javascript -ccp ../../chaincode -c blockchain2025 -cci InitLedger

cd ../../application
rm -rf "wallet"
npm install
npm run dev