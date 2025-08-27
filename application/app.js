const FabricCAServices = require("fabric-ca-client")
const path = require("path")
const express = require("express")
const { buildCCPOrg1, buildCCPOrg2, buildWallet } = require('./utils/AppUtil.js')
const { registerAndEnrollUser, buildCAClient, enrollAdmin } = require('./utils/CAUtil.js')
const { Wallets, Gateway } = require("fabric-network")
const crypto = require("crypto")

const app = express()
app.use(express.json())
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Content-Type")
    next()
})

const channelName = 'blockchain2025'
const chaincodeName = 'dao-system'
const myContractName = "DaoSystem"
const orgMpsIds = {
    "org1": "Fond",
    "org2": "Startups"
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
            wallet, identity, discovery: { enabled: true, asLocalhost: true },
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

app.post("/sendEvent", async(req, res) => {
    try {
        const { event } = req.body
        await postFunc(myContractName, "org1", "admin", "fetchEvent", [event])
        res.send("Event is sended")
    } catch (e) {
        console.error(e)
    }
})

app.get("/loginToManagement", async (req, res) => {
    try {
        const { address, password } = req.body
        const result = await getFunc(myContractName, "org1", login, "loginToManagement", [address, password])
        res.status(200).json({ user: result })
    } catch (err) {
        console.error(err)
        res.status(401).json({
            error: "Неправильный логин, пароль или ключ"
        })
    }
})

app.get("/getStartup", async (req, res) => {
    try {
        const { address } = req.body
        const result = await getFunc(myContractName, "org1", login, "getStartup", [address])
        res.status(200).json({ startup: JSON.parse(result) })
    } catch (err) {
        console.error(err)
        res.status(401).json({
            error: err.message || "Неправильный логин, пароль или ключ"
        })
    }
})

app.post("/createStartup", async (req, res) => {
    try {
        const { address, password } = req.body
        console.log(address, password)
        await postFunc(myContractName, "org1", "admin", "createStartup", [address, password])
        res.send("Startup is registered")
    } catch (e) {
        console.error(e)
    }
})

app.get("/hash/:secret", async (req, res) => {
    const { secret } = req.params
    const result = hash(secret)
    res.status(200).json({ hash: result })
})

app.get('/getAllStartups', async (req, res) => {
    try {
        const result = await getFunc(myContractName, "org1", "admin", "getAllUsers", [])
        res.send(result)
    } catch (e) {
        res.status(500).send(e.message)
    }
})

app.get('/getEvent', async (req, res) => {
    try {
        const { id } = req.params
        const result = await getFunc(myContractName, "org1", "admin", "getEvent", [])
        res.send(result)
    } catch(e) {
        res.status(500).send(e.message)
    }
})

const main = async () => {
    async function regAdmin(organization) {
        await registerAdmin(organization)
    }

    await regAdmin("org1")
}

main().catch(console.error);

app.listen(3000)