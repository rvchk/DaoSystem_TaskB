const contractABI = require("./abi/abi.json");
const { postFunc } = require("./app")
const { ethers } = require("ethers");
const { Web3 } = require("web3")


const web3 = new Web3("http://localhost:8545");
const provider = new ethers.JsonRpcProvider("http://localhost:8545");
const ownerAddress = "0xda82d8e188e355c380d77616B2b63b0267aA68eD";

let contract = null;
let eventCount = 1;

// Поиск и инициализация контракта
async function initializeContract() {
  const nonce = await provider.getTransactionCount(ownerAddress);

  if (nonce > 0) {
  const contractAddress = ethers.getCreateAddress({
      from: ownerAddress,
      nonce: nonce - eventCount,
  });

  console.log("Contract found:", contractAddress);
  contract = new web3.eth.Contract(contractABI, contractAddress);
  return contract;
  }
}

// Получение событий ProposalCreated
async function fetchProposalEvents(contract) {
  try {
    const events = await contract.getPastEvents("allEvents", {
      fromBlock: 0,
      toBlock: "latest",
    });

    if (events.length > 0) {
      console.log(`📊 Found ${events.length} events`);
      eventCount = events.length + 1;
      console.log(events)
    }

    return events;
  } catch (error) {
    console.error("❌ Event fetching failed:", error.message);
  }
}

// Основной цикл мониторинга
async function monitorContract() {
  if (!contract) {
    await initializeContract();
  }

  if (contract) {
    await fetchProposalEvents(contract);
  }
}

module.exports = { initializeContract, monitorContract }