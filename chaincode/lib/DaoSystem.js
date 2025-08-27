'use strict'

const { Contract } = require("fabric-contract-api");

class DaoSystem extends Contract {
  async InitLedger(ctx) {
    console.log("Инициализация реестра...");

    // const startups = [
    //   {
    //     ethereumAddress: ethereumAddress,
    //     organization: "Startups",
    //     fundingReceived: false,
    //     totalFunding: 0,
    //     departments: {
    //       management: 0,
    //       marketing: 0,
    //       development: 0,
    //       legal: 0,
    //     },
    //     requests: [],
    //     managementPasswordHash: passwordHash,
    //     managementLoggedIn: false,
    //   }
    // ];

    // for (const startup of startups) {
    //   // Проверяем, существует ли уже стартап
    //   const existingStartupAsBytes = await ctx.getState(startup.ethereumAddress);
    //   if (!existingStartupAsBytes || existingStartupAsBytes.length === 0) {
    //     console.log(`Создаём начальный стартап: ${startup.ethereumAddress}`);
    //     await ctx.setState(startup.ethereumAddress, Buffer.from(JSON.stringify(startup)));

    //     // Записываем событие
    //     await this.recordEvent(ctx, "INIT_LEDGER", {
    //       startupAddress: startup.ethereumAddress,
    //       message: "Initial startup created during ledger initialization",
    //     });
    //   }
    // }

    console.log("Реестр успешно инициализирован");
  }

  async hashPassword(password) {
    return crypto.createHash("sha256").update(password).digest("hex");
  }

  // === Методы для работы с журналом активности ===
  async recordEvent(ctx, eventType, data) {
    const timestamp = new Date().toISOString();
    const event = {
      type: eventType,
      data: data,
      timestamp: timestamp,
    };

    const key = `event_${Date.now()}`;
    await ctx.stub.setState(key, Buffer.from(JSON.stringify(event)));
  }

  // === Создание нового стартапа с паролем управления ===
  async createStartup(ctx, ethereumAddress, managementPassword) {

    const startupAsBytes = await ctx.stub.getState(ethereumAddress);
    if (startupAsBytes && startupAsBytes.length > 0) {
      throw new Error(`Стартап с адресом ${ethereumAddress} уже существует`);
    }

    // Хэшируем пароль
    const passwordHash = hashPassword(managementPassword);

    const startup = {
      ethereumAddress: ethereumAddress,
      organization: "Startups",
      fundingReceived: false,
      totalFunding: 0,
      departments: {
        management: 0,
        marketing: 0,
        development: 0,
        legal: 0,
      },
      requests: [],
      managementPasswordHash: passwordHash, // Сохраняем хэш
      managementLoggedIn: false, // Сессия не активна
    };

    await ctx.stub.setState(ethereumAddress, Buffer.from(JSON.stringify(startup)));
  }

  // === Вход в отдел управления ===
  async loginToManagement(ctx, ethereumAddress, password) {
      const startupAsBytes = await ctx.stub.getState(ethereumAddress);

      if (!startupAsBytes || startupAsBytes.length === 0) {
          throw new Error(`Стартап с адресом ${ethereumAddress} не найден`);
      }

      const startup = JSON.parse(startupAsBytes.toString());

      const providedHash = hashPassword(password);

      if (startup.managementPasswordHash !== providedHash) {
          throw new Error('Неверный пароль');
      }

      startup.managementLoggedIn = true;      
      this.getStartup(ethereumAddress)
  }

  // === Распределение средств между организациями ===
  async distributeFundsToStartup(ctx, startupId, amount) {
    const startupAsBytes = await ctx.getState(startupId);
    if (!startupAsBytes || startupAsBytes.length === 0) {
      throw new Error(`Стартап с ID ${startupId} не найден`);
    }

    const startup = JSON.parse(startupAsBytes.toString());
    if (startup.fundingReceived) {
      throw new Error(`Финансирование уже было распределено`);
    }

    startup.fundingReceived = true;
    startup.totalFunding = amount;

    // Распределение внутри стартапа
    await this.distributeFundsInsideStartup(ctx, startupId, amount);

    await ctx.setState(startupId, Buffer.from(JSON.stringify(startup)));

    await this.recordEvent(ctx, "FUNDS_DISTRIBUTED_TO_STARTUP", {
      startupId: startupId,
      amount: amount,
    });
  }

  // === Распределение внутри стартапа ===
  async distributeFundsInsideStartup(ctx, startupId, totalAmount) {
    const startupAsBytes = await ctx.getState(startupId);
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

    await ctx.setState(startupId, Buffer.from(JSON.stringify(startup)));

    await this.recordEvent(ctx, "FUNDS_DISTRIBUTED_INSIDE_STARTUP", {
      startupId: startupId,
      distribution: startup.departments,
    });
  }

  // === Подача заявки на расходы (только не-управление) ===
  async submitExpenseRequest(ctx, startupId, department, purpose, amount) {
    const startupAsBytes = await ctx.getState(startupId);
    if (!startupAsBytes || startupAsBytes.length === 0) {
      throw new Error(`Стартап с ID ${startupId} не найден`);
    }

    const startup = JSON.parse(startupAsBytes.toString());

    if (department === "management") {
      throw new Error("Отдел управления не может подавать заявки на расходы");
    }

    // Проверяем, хватает ли средств у отдела
    const currentBalance = startup.departments[department];
    if (currentBalance < amount) {
      throw new Error(`Недостаточно средств в отделе ${department}`);
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
    await ctx.setState(startupId, Buffer.from(JSON.stringify(startup)));

    await this.recordEvent(ctx, "EXPENSE_REQUEST_SUBMITTED", {
      requestId: requestId,
      department: department,
      amount: amount,
      purpose: purpose,
    });

    console.log(`Заявка на расходы от ${department} отправлена: ${amount}`);
  }

  // === Одобрение/отклонение заявки (только управление) ===
  async approveExpenseRequest(ctx, startupId, requestId, action) {
    const startupAsBytes = await ctx.getState(startupId);
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
      const department = request.department;
      startup.departments[department] -= request.amount;
    }

    startup.requests[requestIndex] = request;
    await ctx.setState(startupId, Buffer.from(JSON.stringify(startup)));

    await this.recordEvent(ctx, `EXPENSE_REQUEST_${action.toUpperCase()}`, {
      requestId: requestId,
      department: request.department,
      amount: request.amount,
      status: request.status,
    });

    console.log(`Заявка ${requestId} ${action}ирована`);
  }

  // === Перераспределение средств между отделами (только управление) ===
  async redistributeFunds(
    ctx,
    startupId,
    fromDepartment,
    toDepartment,
    amount
  ) {
    const startupAsBytes = await ctx.getState(startupId);
    if (!startupAsBytes || startupAsBytes.length === 0) {
      throw new Error(`Стартап с ID ${startupId} не найден`);
    }

    const startup = JSON.parse(startupAsBytes.toString());

    if (fromDepartment !== "management") {
      throw new Error(
        "Перераспределение может производить только отдел управления"
      );
    }

    if (startup.departments[fromDepartment] < amount) {
      throw new Error(`Недостаточно средств в отделе ${fromDepartment}`);
    }

    startup.departments[fromDepartment] -= amount;
    startup.departments[toDepartment] += amount;

    await ctx.setState(startupId, Buffer.from(JSON.stringify(startup)));

    await this.recordEvent(ctx, "FUNDS_REDISTRIBUTED", {
      from: fromDepartment,
      to: toDepartment,
      amount: amount,
    });

    console.log(
      `Средства в размере ${amount} перераспределены из ${fromDepartment} в ${toDepartment}`
    );
  }

  // === Контроль за финансированием: авто-запрос на дофинансирование ===
  async checkAndCreateRefundRequest(ctx, startupId) {
    const startupAsBytes = await ctx.getState(startupId);
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
        await ctx.setState(startupId, Buffer.from(JSON.stringify(startup)));

        await this.recordEvent(ctx, "AUTO_REFUND_REQUEST_CREATED", {
          department: dept,
          amount: request.amount,
        });

        console.log(
          `Авто-запрос на дофинансирование для ${dept}: ${request.amount}`
        );
      }
    }
  }

  // === Получение информации о стартапе ===
  async getStartup(ctx, startupAddress) {
    const startupAsBytes = await ctx.getState(startupAddress);
    if (!startupAsBytes || startupAsBytes.length === 0) {
      throw new Error(`Стартап с адресом ${startupAddress} не найден`);
    }

    const startup = JSON.parse(startupAsBytes.toString());
    return startup
  }

  // === Получение всех событий ===
  async getAllEvents(ctx) {
    const allResults = [];
    const iterator = await ctx.getStateByRange("", "");
    let result = await iterator.next();

    while (!result.done) {
      if (result.value && result.value.value.toString()) {
        allResults.push(JSON.parse(result.value.value.toString()));
      }
      result = await iterator.next();
    }

    return JSON.stringify(allResults);
  }

  // === Пример метода для обработки события из Ethereum ===
  async handleEthereumEvent(ctx, eventType, payload) {
    const data = JSON.parse(payload);
    if (eventType === "NEW_STARTUP") {
      await this.createStartup(ctx, data.startupId, data.ethereumAddress);
    } else if (eventType === "VOTE_ACCEPTED") {
      await this.distributeFundsToStartup(ctx, data.startupId, data.amount);
    }
  }
}

module.exports = DaoSystem;
