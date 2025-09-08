'use strict'

const { Contract } = require("fabric-contract-api");

class DaoSystem extends Contract {

  async InitLedger() {
    console.log("Init")
  }

  // === Создание нового стартапа ===
  async createStartup(ctx, address, amount) {
    const startupAsBytes = await ctx.stub.getState(address);
    if (startupAsBytes && startupAsBytes.length > 0) {
      throw new Error(`Стартап с адресом ${address} уже существует`);
    }

    const startup = {
      address: address,
      password: '',
      organization: "Startups",
      fundingReceived: true,
      totalFunding: amount,
      departments: {
        management: 0,
        marketing: 0,
        development: 0,
        legal: 0,
      },
      requests: [],
      managementLoggedIn: false,
    };

    await ctx.stub.putState(address, Buffer.from(JSON.stringify(startup)));
    return startup;
  }

  async setPassword(ctx, address, password) {
    const startupAsBytes = await ctx.stub.getState(address);

    const startup = JSON.parse(startupAsBytes.toString());
    startup.password = password

    await ctx.stub.putState(address, Buffer.from(JSON.stringify(startup)));
  }

  // === Вход в отдел управления ===
  async loginToManagement(ctx, address, password) {
      const startupAsBytes = await ctx.stub.getState(address);

      if (!startupAsBytes || startupAsBytes.length === 0) {
          throw new Error(`Стартап с адресом ${address} не найден`);
      }

      const startup = JSON.parse(startupAsBytes.toString());

      if (startup.password !== password) {
          throw new Error('Неверный пароль', startup.password, "  ", password);
      }

      startup.managementLoggedIn = true;
      await ctx.stub.putState(address, Buffer.from(JSON.stringify(startup)));
      return startup
  }

  // === Распределение внутри стартапа ===
  async distributeFundsInsideStartup(ctx, startupId, totalAmount) {
    const startupAsBytes = await ctx.stub.getState(startupId);
    if (!startupAsBytes || startupAsBytes.length === 0) {
      throw new Error(`Стартап с ID ${startupId} не найден`);
    }

    const startup = JSON.parse(startupAsBytes.toString());

    const managementShare = 0.45;
    const marketingShare = 0.1;
    const developmentShare = 0.4;
    const legalShare = 0.05;

    startup.departments.management = totalAmount * managementShare;
    startup.departments.marketing = totalAmount * marketingShare;
    startup.departments.development = totalAmount * developmentShare;
    startup.departments.legal = totalAmount * legalShare;

    await ctx.stub.putState(startupId, Buffer.from(JSON.stringify(startup)));
  }

  // === Подача заявки на расходы (только не-управление) ===
  async sendRealisationRequest(ctx, startupId, department, purpose, percentage, fromStartBalance) {
    const startupAsBytes = await ctx.stub.getState(startupId);
    if (!startupAsBytes || startupAsBytes.length === 0) {
      throw new Error(`Стартап с ID ${startupId} не найден`);
    }

    const startup = JSON.parse(startupAsBytes.toString());

    if (department === "management") {
      throw new Error("Отдел управления не может подавать заявки на расходы");
    }

    // Проверяем, хватает ли средств у отдела
    const currentBalance = startup.departments[department];
    let amount = 0;
    if (fromStartBalance) {
      // от баланса при создании самого стартапа
    } else {
      amount = (currentBalance * percentage) / 100;
    }

    const requestId = `req_${Date.now()}`;
    const request = {
      id: requestId,
      department: department,
      purpose: purpose,
      amount: amount,
      status: "pending", // pending, approved, rejected
      submittedAt: new Date().toISOString(),
    };

    startup.requests.push(request);
    await ctx.stub.putState(startupId, Buffer.from(JSON.stringify(startup)));

    console.log(`Заявка на расходы от ${department} отправлена: ${amount}`);
  }

  async approveRealisationRequest(ctx, startupId, requestId, action) {
    const startupAsBytes = await ctx.stub.getState(startupId);
    if (!startupAsBytes || startupAsBytes.length === 0) {
      throw new Error(`Стартап с ID ${startupId} не найден`);
    }

    const startup = JSON.parse(startupAsBytes.toString());

    const requestIndex = startup.requests.findIndex((r) => r.id === requestId);
    if (requestIndex === -1) {
      throw new Error(`Заявка с ID ${requestId} не найдена`);
    }

    const request = startup.requests[requestIndex];

    if (action !== "approve" && action !== "reject") {
      throw new Error("Действие должно быть 'approve' или 'reject'");
    }

    if (request.status !== "pending") {
      throw new Error("Заявка уже обработана");
    }

    request.status = action;
    request.processedAt = new Date().toISOString();

    // При одобрении списываем средства
    if (action === "approve") {
      startup.departments[request.department] += request.amount
      startup.departments.management -= request.amount;
    }

    startup.requests[requestIndex] = request;
    await ctx.stub.putState(startupId, Buffer.from(JSON.stringify(startup)));

    console.log(`Заявка ${requestId} ${action}ирована`);
  }

  // === Контроль за финансированием: авто-запрос на дофинансирование ===
  async checkAndCreateRefundRequest(ctx, startupId) {
    const startupAsBytes = await ctx.stub.getState(startupId);
    if (!startupAsBytes || startupAsBytes.length === 0) {
      throw new Error(`Стартап с ID ${startupId} не найден`);
    }

    const startup = JSON.parse(startupAsBytes.toString());

    // Проверяем каждый отдел (кроме управления)
    for (const dept of ["marketing", "development", "legal"]) {
      const initialAmount = startup.departments[dept];
      const currentAmount = startup.departments[dept];

      if (initialAmount > 0 && currentAmount <= initialAmount * 0.1) {
        // Остаток ≤ 10% — создаем запрос
        const requestId = `refund_req_${Date.now()}`;
        const request = {
          id: requestId,
          department: dept,
          purpose: "Автоматический запрос на дофинансирование",
          amount: initialAmount * 0.1,
          status: "pending",
          submittedAt: new Date().toISOString(),
          autoGenerated: true,
        };

        startup.requests.push(request);
        await ctx.stub.putState(startupId, Buffer.from(JSON.stringify(startup)));
      }
    }
  }

  // === Получение информации о стартапе ===
  async getStartup(ctx, address) {
    const startupAsBytes = await ctx.stub.getState(address);
    if (!startupAsBytes || startupAsBytes.length === 0) {
      throw new Error(`Стартап с адресом ${address} не найден`);
    }

    const startup = JSON.parse(startupAsBytes.toString());
    return startup
  }

  // === Пример метода для обработки события из Ethereum ===
  async handleEthereumEvent(ctx, eventType, payload) {
    const data = JSON.parse(payload);
    if (eventType === "NEW_STARTUP") {
      await this.createStartup(ctx, data.startupId, data.address);
    } else if (eventType === "VOTE_ACCEPTED") {
      await this.distributeFundsToStartup(ctx, data.startupId, data.amount);
    }
  }
}

module.exports = DaoSystem;
