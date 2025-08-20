const { Web3 } = require("web3");
const contractABI = require("./abi/abi.json");

async function getEvents() {
    const web3 = new Web3("http://localhost:8545");
    const contract = new web3.eth.Contract(contractABI)

    const result = await contract.getPastEvents("ProposalCreated", {
        fromBlock: 0,
        toBlock: "latest",
    });
    return result
}

async function initEventListener(myContractName, postFunc) {
    let lastEventCount = 0;

    const checkEvents = async () => {
        try {
            const events = await getEvents();
            const currentCount = events ? events.length : 0;

            // Если количество изменилось или это первый запуск
            if (currentCount !== lastEventCount) {
                if (events && events.length > 0) {
                    // console.log(`Found ${events.length} events`);
                    
                    await processEvents(events, postFunc, myContractName);
                    // console.log(events)

                } else {
                    console.log('No events found');
                }
                
                lastEventCount = currentCount;
            }
        } catch (error) {
            console.error("Error checking events:", error);
        }
    };

    // Проверяем каждые 5 секунд
    setInterval(checkEvents, 5000);
    
    // Проверяем сразу при запуске
    await checkEvents();
}

async function processEvents(events, postFunc, myContractName) {
    for (const event of events) {
        try {
            // Преобразуем объект в JSON строку
            const eventDescription = event.returnValues.description;
            console.log(eventDescription)
            
            await postFunc(
                myContractName, 
                "org1", 
                "admin", 
                "processEthereumEvent", 
                [eventDescription] // Передаем как строку
            );
            
            // console.log('Successfully processed event:', event.returnValues.id);
        } catch (error) {
            console.error('Error processing event:', event.returnValues.id, error);
        }
    }
}

module.exports = { initEventListener };