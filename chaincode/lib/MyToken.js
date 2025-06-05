"use strict"
const ERC20 = require("./tokenERC20.js")
const balancePrefix = 'balance';
const totalSupplyKey = 'totalSupply';

class MyToken extends ERC20 {
  async Initialize(ctx, name, symbol, decimals) {
    await super.Initialize(ctx, name, symbol, decimals.toString());
    const initBalances = [
      {
        userId: "Bank",
        balance: 1000 * 10 ** decimals
      },
      {
        userId: "Ivan",
        balance: 50 * 10 ** decimals
      },
      {
        userId: "Semen",
        balance: 50 * 10 ** decimals
      },
      {
        userId: "Petr",
        balance: 50 * 10 ** decimals
      }
    ]
    let totalSupply = 0
    for (const user of initBalances) {
      const balanceKey = ctx.stub.createCompositeKey(balancePrefix, [user.userId]);
      await ctx.stub.putState(balanceKey, Buffer.from(user.balance.toString()));
      totalSupply += user.balance
    }
    await ctx.stub.putState(totalSupplyKey, Buffer.from(totalSupply.toString()))
  }

  async Transfer(ctx, from, to, value) {
    value = value * 10 ** 12
    // Check contract options are already set first to execute the function
    await this.CheckInitialized(ctx);

    const transferResp = await this._transfer(ctx, from, to, value);
    if (!transferResp) {
      throw new Error('Failed to transfer');
    }

    // Emit the Transfer event
    const transferEvent = { from, to, value: parseInt(value) };
    ctx.stub.setEvent('Transfer', Buffer.from(JSON.stringify(transferEvent)));

    return true;
  }

  async Mint(ctx, user, amount) {
    amount = amount * 10 ** 12
    const amountInt = parseInt(amount);
    if (amountInt <= 0) {
      throw new Error('mint amount must be a positive integer');
    }

    const balanceKey = ctx.stub.createCompositeKey(balancePrefix, [user]);

    const currentBalanceBytes = await ctx.stub.getState(balanceKey);
    console.log(`currentBalanceBytes: ${currentBalanceBytes}`)
    console.log(`balance key: ${balanceKey}`)
    // If minter current balance doesn't yet exist, we'll create it with a current balance of 0
    let currentBalance;
    if (!currentBalanceBytes || currentBalanceBytes.length === 0) {
      currentBalance = 0;
    } else {
      currentBalance = parseInt(currentBalanceBytes.toString());
    }
    const updatedBalance = this.add(currentBalance, amountInt);

    await ctx.stub.putState(balanceKey, Buffer.from(updatedBalance.toString()));

    // Increase totalSupply
    const totalSupplyBytes = await ctx.stub.getState(totalSupplyKey);
    let totalSupply;
    if (!totalSupplyBytes || totalSupplyBytes.length === 0) {
      console.log('Initialize the tokenSupply');
      totalSupply = 0;
    } else {
      totalSupply = parseInt(totalSupplyBytes.toString());
    }
    totalSupply = this.add(totalSupply, amountInt);
    await ctx.stub.putState(totalSupplyKey, Buffer.from(totalSupply.toString()));

    // Emit the Transfer event
    const transferEvent = { from: '0x0', to: user, value: amountInt };
    ctx.stub.setEvent('Transfer', Buffer.from(JSON.stringify(transferEvent)));

    console.log(`minter account ${user} balance updated from ${currentBalance} to ${updatedBalance}`);
    return true;
  }

  async BalanceOf(ctx, user) {

    // Check contract options are already set first to execute the function
    await this.CheckInitialized(ctx);

    const balanceKey = ctx.stub.createCompositeKey(balancePrefix, [user]);

    const balanceBytes = await ctx.stub.getState(balanceKey);
    console.log(balanceBytes)
    if (!balanceBytes || balanceBytes.length === 0) {
      throw new Error(`the account ${user} does not exist`);
    }
    const balance = parseInt(balanceBytes.toString());

    return balance;
  }
}

module.exports = MyToken