cd fabric-samples/test-network

./network.sh down

./network.sh up createChannel -c blockchain2025 -ca

cd ../../chaincode
npm install

cd ../fabric-samples/test-network
./network.sh deployCC -ccn dao-system -ccl javascript -ccp ../../chaincode -c blockchain2025

cd ../../application
rm -rf "wallet"
npm install
npm run dev
