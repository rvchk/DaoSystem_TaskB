const FabricCAServices = require("fabric-ca-client")
const path = require("path")
const { Web3 } = require("web3")
const contractABI = require("./abi.json")
const byteCode = require("./bytecode")
const express = require("express")
const { buildCCPOrg1, buildCCPOrg2, buildWallet } = require('./AppUtil.js')
const { registerAndEnrollUser, buildCAClient, enrollAdmin } = require('./CAUtil.js')
const { Wallets, Gateway } = require("fabric-network")
const crypto = require("crypto")
const { startListening } = require("./oracle.js")
let deployed = {}
let deployedContract = ''

const app = express()
app.use(express.json())
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Content-Type")
    next()
})

const channelName = 'blockchain2025'
const chaincodeName = 'save-traffic-system'
const myContractName = "SaveTrafic"
const orgMpsIds = {
    "org1": "Users",
    "org2": "Bank"
}

const hash = (data) => {
    return crypto.createHash("sha3-256").update(data).digest("hex")
}

function buildCCP(organization) {
    return organization === "org1" ? buildCCPOrg1() : buildCCPOrg2()
}

function buildWalletPath(organization) {
    return path.join(process.cwd(), `wallet/${organization}`)
}

async function registerUser(organization, login) {
    const ccp = buildCCP(organization)
    const caClient = buildCAClient(FabricCAServices, ccp, `ca.${organization}.example.com`)
    const wallet = await buildWallet(Wallets, buildWalletPath(organization))
    await registerAndEnrollUser(caClient, wallet, orgMpsIds[organization], login, `${organization}.department1`)
}

setInterval(async() => {
    console.log("hey")
}, 10000);

async function registerAdmin(organization) {
    const ccp = buildCCP(organization)
    const caClient = buildCAClient(FabricCAServices, ccp, `ca.${organization}.example.com`)
    const wallet = await buildWallet(Wallets, buildWalletPath(organization))
    await enrollAdmin(caClient, wallet, orgMpsIds[organization])
}

async function getGateway(organization, login) {
    try {
        const ccp = buildCCP(organization)
        const wallet = await buildWallet(Wallets, buildWalletPath(organization))
        const identity = await wallet.get(login)
        const gateway = new Gateway()
        await gateway.connect(ccp, {
            wallet, identity, discovery: { enabled: true, asLocalhost: true }
        })
        return gateway
    } catch (e) {
        console.error(`Failed to connect ${e}`)
        throw new Error(e)
    }
}

async function getContract(gateway, contractName) {
    try {
        const network = await gateway.getNetwork(channelName)
        const contract = await network.getContract(chaincodeName, contractName)
        return contract
    } catch (e) {
        console.error(`Failed to get contract: ${e}`)
        throw new Error(e)
    }
}

async function postFunc(contractName, organization, login, func, args) {
    try {
        const gateway = await getGateway(organization, login)
        const contract = await getContract(gateway, contractName)
        const result = await contract.submitTransaction(func, ...args)

        gateway.disconnect()

        return result.toString()
    } catch (e) {
        console.error(`Failed to submit transaction: ${e}`)
    }
}

async function getFunc(contractName, organization, login, func, args) {
    try {
        const gateway = await getGateway(organization, login)
        const contract = await getContract(gateway, contractName)
        const result = await contract.evaluateTransaction(func, ...args)
        gateway.disconnect()
        return result.toString()
    } catch (e) {
        console.error(`Failed to submit transaction: ${e}`)
        throw e
    }
}

app.get("/getAllUsers", async (req, res) => {
    try {
        let users = await getFunc(myContractName, "org1", "admin", "getAllUsers", [])
        users = JSON.parse(users)
        res.status(200).json({ users });
    } catch (e) {
        console.error(e)
    }
})

app.get("/getContractId", async (req, res) => {
    try {
        res.status(200).json({ contractId: deployedContract });
    } catch (e) {
        console.error(e)
    }
})

app.post("/enrollAdmin", async (req, res) => {
    const { organization } = req.body
    try {
        await registerAdmin(organization)
        res.status(200).json({ message: "Admin enrolled successfully" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.toString() });
    }
})

app.post("/enrollUser", async (req, res) => {
    const { organization, login } = req.body
    try {
        await registerUser(organization, login)
        res.send("User enrolled")
    } catch (e) {
        res.send(e)
    }
})

app.post("/auth", async (req, res) => {
    try {
        const { login, password, key } = req.body
        const result = await getFunc(myContractName, "org1", login, "auth", [login, password, key])
        res.status(200).json({ user: result })
    } catch (err) {
        console.error(err)
        res.status(401).json({
            error: err.message || "Неправильный логин, пароль или ключ"
        })
    }
})

app.post("/register", async (req, res) => {
    try {
        const { login, password, key, fio, role, drivingTime, balance } = req.body
        await postFunc(myContractName, "org1", "admin", "register", [login, password, key, fio, role, drivingTime, balance])
        await registerUser("org1", login)
        res.send("User is registered")
    } catch (e) {
        console.error(e)
    }
})

app.post("/requestLicense", async (req, res) => {
    try {
        const { login, licenseNumber } = req.body
        await postFunc(myContractName, "org1", "admin", "requestLicense", [login, licenseNumber])
        res.send("License is requested to DPS")
    } catch (e) {
        console.error(e)
    }
})

app.post("/approveLicense", async (req, res) => {
    try {
        const { dpsLogin, recipientLogin, requestIndex } = req.body
        await postFunc(myContractName, "org1", "admin", "approveLicense", [dpsLogin, recipientLogin, requestIndex])
        res.send("License is approved")
    } catch (e) {
        console.error(e)
    }
})

app.post("/requestVehicle", async (req, res) => {
    try {
        const { login, category, marketPrice, usabilityDate } = req.body
        await postFunc(myContractName, "org1", "admin", "approveLicense", [login, category, marketPrice, usabilityDate])
        res.send("License is approved")
    } catch (e) {
        console.error(e)
    }
})

app.post("/issueFine", async (req, res) => {
    try {
        const { dpsLogin, recipientLogin } = req.body
        await postFunc(myContractName, "org1", "admin", "issueFine", [dpsLogin, recipientLogin])
        res.send("Fine is issued")
    } catch (e) {
        console.error(e)
    }
})

app.post("/payFine/:login", async (req, res) => {
    try {
        const { login } = req.params
        await postFunc(myContractName, "org1", "admin", "payFine", [login])
        res.send("Fine is payed")
    } catch (e) {
        console.error(e)
    }
})

app.get("/getUser/:login", async (req, res) => {
    try {
        const { login } = req.params
        const result = await getFunc(myContractName, "org1", login, "getUser", [login])
        res.status(200).json({ user: JSON.parse(result) })
    } catch (err) {
        res.status(401).json({
            error: err.message || "Неправильный логин, пароль или ключ"
        })
    }
})

app.get("/hash/:secret", async (req, res) => {
    const { secret } = req.params
    const result = hash(secret)
    res.status(200).json({ hash: result })
})

app.get('/getAllUsers', async (req, res) => {
    try {
        const result = await getFunc(myContractName, "org1", "admin", "getAllUsers", [])
        res.send(result)
    } catch (e) {
        res.status(500).send(e.message)
    }
})

app.get("/getTestTime", async (req, res) => {
    try {
        const test = await getFunc(myContractName, "org1", "admin", "getTestTime", [])
        res.send(test)
    } catch (e) {
        console.error(e)
    }
})

app.get("/getAllLicenses", async (req, res) => {
    try {
        const result = await getFunc(myContractName, "org1", "admin", "getAllLicenses", [])
        res.send(result)
    } catch (e) {
        console.error(e)
    }
})

app.get("/getBalance/:login", async (req, res) => {
    try {
        const { login } = req.params
        const balance = await getFunc(myContractName, "org1", "admin", "getBalance", [login])
        res.send(balance)
    } catch (e) {
        console.error(e)
    }
})

const main = async () => {
    async function regAdmin(organization) {
        await registerAdmin(organization)
    }
    async function regUser(organization, login) {
        await registerUser(organization, login)
    }

    await regAdmin("org1")
    await regUser("org1", "Ivan")
    await regUser("org1", "Semen")
    await regUser("org1", "Petr")
}

main().catch(console.error);

app.listen(3000, async () => {
  const web3 = new Web3("http://localhost:8545")

  try {
    // Получаем список аккаунтов
    const accounts = await web3.eth.getAccounts()
    const ownerAddress = accounts[0]

    console.log("Используем аккаунт:", ownerAddress)

    // Создаём экземпляр контракта
    const contract = new web3.eth.Contract(contractABI)
    const deployedTransaction = contract.deploy({ data: byteCode })

    // Оцениваем gas
    const gas = "9986871"
    const gasPrice = await web3.eth.getGasPrice()

    // Параметры транзакции
    const options = {
      from: ownerAddress,
      gas,
      gasPrice
    }

    // Отправляем транзакцию
    deployed = await deployedTransaction.send(options)
    deployedContract = deployed.options.address
    console.log("Контракт развернут по адресу:", deployedContract)

    await startListening(deployed, postFunc)

  } catch (err) {
    console.error("Ошибка при деплое контракта:", err.message)
  }
})