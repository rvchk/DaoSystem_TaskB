const contractABI = require("./abi/abi.json");
const { ethers } = require("ethers");
const { Web3 } = require("web3")

const web3 = new Web3("http://localhost:8545");
const provider = new ethers.JsonRpcProvider("http://localhost:8545");
const ownerAddress = "0xda82d8e188e355c380d77616B2b63b0267aA68eD";

const myContractName = "DaoSystem";
let lastProcessedEventId = null;
let contract = null;
let eventCount = 5;

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
async function fetchProposalEvents(contract, postFunc) {
  try {
    const events = await contract.getPastEvents("allEvents", {
      fromBlock: 0,
      toBlock: "latest",
    });
    events.shift()

    if (events.length > 0) {
      eventCount = events.length + 1;
    }

    for (const event of events) {
      const eventId = `${event.blockNumber}_${event.logIndex}`;

      // Проверяем, не обрабатывали ли мы это событие
      if (!lastProcessedEventId || eventId > lastProcessedEventId) {
        console.log("🆕 New event detected:", event.event);
        handleEvent(event, postFunc)
        console.log(`Отправил этот ивент = ${event.returnValues.id}`)

        // Обновляем последний обработанный ID
        lastProcessedEventId = eventId;
      }
    }

    return events;
  } catch (error) {
    console.error("❌ Event fetching failed:", error.message);
  }
}

async function handleEvent(event, postFunc) {
  if (event.event == "NewStartupInvestment") {
    console.log("EVENT", event.event)
    await postFunc(myContractName, "org1", "admin", "createStartup", [event.returnValues.startup, event.returnValues.amount])
    await postFunc(myContractName, "org1", "admin", "distributeFundsInsideStartup", [event.returnValues.startup, event.returnValues.amount])
  }
}

// Основной цикл мониторинга
async function monitorContract(postFunc) {
  if (!contract) {
    await initializeContract();
  }

  if (contract) {
    await fetchProposalEvents(contract, postFunc);
  }
}

module.exports = { initializeContract, monitorContract }