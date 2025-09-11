'use strict'

const { Contract } = require("fabric-contract-api");

class DaoSystem extends Contract {

  // === Создание нового стартапа ===
  async createStartup(ctx, address) {
    const startupAsBytes = await ctx.stub.getState(address);
    if (startupAsBytes && startupAsBytes.length > 0) {
      throw new Error(`Стартап с адресом ${address} уже существует`);
    }

    const startup = {
      address: address,
      password: '',
      organization: "Startups",
      fundingReceived: true,
      totalFunding: 0,
      departments: {
        management: 0,
        marketing: 0,
        development: 0,
        legal: 0,
      },
      initialDepartments: {
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
  async distributeFundsInsideStartup(ctx, address, totalAmount) {
    const startupAsBytes = await ctx.stub.getState(address);
    if (!startupAsBytes || startupAsBytes.length === 0) {
      throw new Error(`Стартап с ID ${address} не найден`);
    }
    totalAmount = parseFloat(totalAmount)

    const startup = JSON.parse(startupAsBytes.toString());

    const managementShare = 0.45;
    const marketingShare = 0.1;
    const developmentShare = 0.4;
    const legalShare = 0.05;

    startup.departments.management += totalAmount * managementShare;
    startup.departments.marketing += totalAmount * marketingShare;
    startup.departments.development += totalAmount * developmentShare;
    startup.departments.legal += totalAmount * legalShare;

    startup.initialDepartments = { ...startup.departments }

    startup.totalFunding += totalAmount

    await ctx.stub.putState(address, Buffer.from(JSON.stringify(startup)));
  }

  // === Подача заявки на расходы (только не-управление) ===
  async sendRealisationRequest(ctx, address, department, purpose, percentage, fromStartBalance = "false") {
    const startupAsBytes = await ctx.stub.getState(address);
    if (!startupAsBytes || startupAsBytes.length === 0) {
      throw new Error(`Стартап с ID ${address} не найден`);
    }

    const startup = JSON.parse(startupAsBytes.toString());

    if (department === "management") {
      throw new Error("Отдел управления не может подавать заявки на расходы");
    }

    // Проверяем, хватает ли средств у отдела
    let amount = 0;
    if (fromStartBalance) {
      const initialBalance = startup.initialDepartments[department];
      amount = (initialBalance * parseFloat(percentage)) / 10
    } else {
      const currentBalance = startup.departments[department];
      amount = (currentBalance * parseFloat(percentage)) / 100;
    }

    const txId = ctx.stub.getTxID();
    const requestCount = startup.requests.length;
    const requestId = `req_${txId}_${requestCount}`;

    const request = {
      id: requestId,
      department: department,
      purpose: purpose,
      amount: amount,
      status: "pending", // pending, approved, rejected
      submittedAt: ctx.stub.getTxTimestamp().seconds.low * 1000,
    };

    startup.requests.push(request);
    await ctx.stub.putState(address, Buffer.from(JSON.stringify(startup)));

    console.log(`Заявка на расходы от ${department} отправлена: ${amount}`);
  }

  async approveRequest(ctx, address, requestId, action) {
    const startupAsBytes = await ctx.stub.getState(address);
    if (!startupAsBytes || startupAsBytes.length === 0) {
      throw new Error(`Стартап с ID ${address} не найден`);
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
    request.processedAt = ctx.stub.getTxTimestamp().seconds.low * 1000;

    // При одобрении списываем или добавляем средства
    if (action === "approve") {
      if (request.purpose == "realise") {
        startup.departments[request.department] -= request.amount
      }
      if (request.purpose == "getFinance") {
        startup.departments[request.department] += request.amount
        startup.departments.management -= request.amount;
      }
    }

    startup.requests[requestIndex] = request;
    await this.checkAndCreateRefundRequest(address)
    await ctx.stub.putState(address, Buffer.from(JSON.stringify(startup)));

    console.log(`Заявка ${requestId} ${action}ирована`);
  }

  async transferFromManagement(ctx, address, department, percentage) {
    const startupAsBytes = await ctx.stub.getState(address);
    if (!startupAsBytes || startupAsBytes.length === 0) {
      throw new Error(`Стартап с ID ${address} не найден`);
    }

    const startup = JSON.parse(startupAsBytes.toString());

    let amount = 0;
    const currentBalance = startup.departments[department];
    amount = (currentBalance * parseFloat(percentage)) / 100;

    startup.departments[department] += amount;
    startup.departments.management -= amount;

    await ctx.stub.putState(address, Buffer.from(JSON.stringify(startup)));
  }

  // === Контроль за финансированием: авто-запрос на дофинансирование ===
  async checkAndCreateRefundRequest(ctx, address) {
    const startupAsBytes = await ctx.stub.getState(address);
    if (!startupAsBytes || startupAsBytes.length === 0) {
      throw new Error(`Стартап с ID ${address} не найден`);
    }

    const startup = JSON.parse(startupAsBytes.toString());

    // Проверяем каждый отдел (кроме управления)
    for (const dept of ["marketing", "development", "legal"]) {
      const initialAmount = startup.initialDepartments[dept];
      const currentAmount = startup.departments[dept];

      if (initialAmount > 0 && currentAmount <= initialAmount * 0.1) {
        // Остаток ≤ 10% — создаем запрос
        const txId = ctx.stub.getTxID();
        const requestCount = startup.requests.length;
        const requestId = `req_${txId}_${requestCount}`;

        const request = {
          id: requestId,
          department: dept,
          purpose: "getFinance",
          amount: initialAmount * 0.1,
          status: "pending",
          submittedAt: ctx.stub.getTxTimestamp().seconds.low * 1000,
        };

        startup.requests.push(request);
        await ctx.stub.putState(address, Buffer.from(JSON.stringify(startup)));
      }
    }
  }

  async saveEvent(ctx, title, eventData) {
    let events = [];

    const eventsAsBytes = await ctx.stub.getState(title);
    if (eventsAsBytes && eventsAsBytes.length > 0) {
      events = JSON.parse(eventsAsBytes.toString());
    }

    events.push(eventData);

    await ctx.stub.putState(title, Buffer.from(JSON.stringify(events)));
    return events
  }

  async getEvents(ctx) {
    const eventsAsBytes = await ctx.stub.getState('events');

    if (!eventsAsBytes || eventsAsBytes.length === 0) {
      return [];
    }

    const events = JSON.parse(eventsAsBytes.toString())
    return events
  }

  async getStartup(ctx, address) {
    const startupAsBytes = await ctx.stub.getState(address);
    if (!startupAsBytes || startupAsBytes.length === 0) {
      throw new Error(`Стартап с адресом ${address} не найден`);
    }

    const startup = JSON.parse(startupAsBytes.toString());
    return startup
  }
}

module.exports = DaoSystem;
