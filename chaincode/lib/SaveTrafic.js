"use strict"

const { Contract } = require("fabric-contract-api")
const MyToken = require("./MyToken")

const createRequestLicense = (requestIndex, category, licenseNumber) => {
  return {
    RequestIndex: requestIndex,
    RequestName: "LicenseRequest",
    Category: category,
    LicenseNumber: licenseNumber,
    RequestStatus: "Отправлена"
  }
}
const createLicense = (license) => {
  return {
    UnpaidFines: 0,
    Category: license.category,
    LicenseNumber: license.number,
    Expiration: license.usabilityDate
  }
};

const createRequestVehicle = (requestIndex, category, marketPrice, usabilityDate) => {
  return {
    RequestIndex: requestIndex,
    RequestName: "VehicleRequest",
    Category: category,
    MarketPrice: marketPrice,
    UsabilityDate: usabilityDate,
    RequestStatus: "Отправлена",
  }
};
const createVehicle = (findedRequest) => {
  return {
    Category: findedRequest.Category,
    MarketPrice: findedRequest.MarketPrice,
    UsabilityDate: findedRequest.UsabilityDate,
  }
}

const parseDateToValue = (date) => {
  const value = new Date(date);
  // Получаем миллисекунды
  return value.getTime();
}

const driverLicenses = [
  {
    number: "000",
    usabilityDate: parseDateToValue("2021-11-21"),
    category: "A"
  },
  {
    number: "111",
    usabilityDate: parseDateToValue("2025-05-12"),
    category: "B"
  },
  {
    number: "222",
    usabilityDate: parseDateToValue("2020-09-09"),
    category: "C"
  },
  {
    number: "333",
    usabilityDate: parseDateToValue("2027-02-13"),
    category: "A"
  },
  {
    number: "444",
    usabilityDate: parseDateToValue("2020-09-10"),
    category: "B"
  },
  {
    number: "555",
    usabilityDate: parseDateToValue("2029-06-24"),
    category: "C"
  },
  {
    number: "666",
    usabilityDate: parseDateToValue("2030-03-31"),
    category: "A"
  }
]

class SaveTrafic extends Contract {
  constructor() {
    super();
    this.userlogins = [];
    this.token = new MyToken()
    //Перечисления, в js нету enum поэтому использую object
    this.userRoles = {
      DPSOFFICER: "DpsOfficer",
      DRIVER: "Driver",
    };
    this.requestStatus = {
      REGISTERED: "Отправлена",
      APPROVED: "Подтверждена",
    };
    this.startAppDate = new Date();
  }

  // Основная функция запуска системы, инициализирует контракт Токена, создает пользователей системы
  async InitLedger(ctx) {

    // Сначало инициализируй, а потом выполняй другие функции
    await this.token.Initialize(ctx, "MyToken", "MTK", "12")

    const bank = {
      Login: "Bank",
      Balance: 1000
    }
    const drivers = [
      {
        Login: "Ivan",
        Password: "658db3293b9b4fce0f30ed74a52627d0acaef6b5a1cfe56984a01334d25962d7",
        Key: "caa614440e81e861d64cd5beca23ddfa83dd93ebdd221bf4588a7d3351276f91",
        Fio: "Иванов Иван Иванович",
        Role: this.userRoles.DPSOFFICER,
        YearStartDriving: 2,
        TotalUnpayedFines: 0,
        Balance: 50, //Profi tokens
        Requests: [],
        Licenses: [],
        Vehicles: [],
      },
      {
        Login: "Semen",
        Password: "e019ed7df7de82267145a7b69b634361fbb17cc8a7a94627ee698c7bfa94369c",
        Key: "e40d71b92347b798af82d36d7bd065c2dec541ea6b020bafbdcfac486d605165",
        Fio: "Семенов Семен Семенович",
        Role: this.userRoles.DRIVER,
        YearStartDriving: 5,
        TotalUnpayedFines: 0,
        Balance: 50, //Profi tokens
        Requests: [],
        Licenses: [],
        Vehicles: [],
      },
      {
        Login: "Petr",
        Password: "42153e945c633915211b4c40c25bafec0b11bcf7481184b4ef9322b30b99e341",
        Key: "a36f9478cfb00e941d7d3eab867b7b4df82b1a0478e84cd82561bee887bdd0e0",
        Fio: "Петров Петр Петрович",
        Role: this.userRoles.DRIVER,
        YearStartDriving: 10,
        TotalUnpayedFines: 0,
        Balance: 50, //Profi tokens
        Requests: [],
        Licenses: [],
        Vehicles: [],
      }
    ]

    for (const driver of drivers) {
      await ctx.stub.putState(driver.Login, Buffer.from(JSON.stringify(driver)))
    }
    await ctx.stub.putState(bank.Login, Buffer.from(JSON.stringify(bank)))
    this.userlogins = ["Ivan", "Semen", "Petr"];
  }

  // Функция для получения баланса пользователя
  // Принимает контекст и логин пользователя, возвращает баланс
  async getBalance(ctx, login) {
    const balance = await this.token.BalanceOf(ctx, login)
    return balance.toString()
  }

  // Функция для авторизации пользователя
  // Принимает контекст, логин, пароль и ключ пользователя, возвращает аккаунт в который вошел
  async auth(ctx, login, password, key) {
    const findedUserJSON = await ctx.stub.getState(login)
    if (!findedUserJSON || findedUserJSON.length == 0) {
      throw new Error("Нету пользователя с таким логином")
    }
    const findedUser = JSON.parse(findedUserJSON.toString())
    if (findedUser.Password === password && findedUser.Key === key) {
      return findedUser
    } else {
      throw new Error("Неправильный пароль или ключ")
    }
  }

  // Функция для запроса лицензии для пользователя
  // Принимает контекст, логин пользователя, номер лицензии и категорию
  // В конце кладет запрос в массив запросов пользователя
  async requestLicense(ctx, login, licenseNumber) {
    const findedUserJSON = await ctx.stub.getState(login)
    if (!findedUserJSON || findedUserJSON.length == 0) {
      throw new Error("Нету пользователя с таким логином")
    }
    const user = JSON.parse(findedUserJSON.toString())

    const license = driverLicenses.find(license =>
      license.number === licenseNumber.toString() // Используем строгое сравнение
    );

    const licenseRequest = createRequestLicense(user.Requests.length, license.category, licenseNumber)

    user.Requests.push(licenseRequest)
    await ctx.stub.putState(login, Buffer.from(JSON.stringify(user)))
  }

  // Функция для подтверждения лицензии
  // Принимает контекст, логин ДПСника, логин запрашивающего, индекс запроса и expiration
  // При успешном выполнении добавляет лицензию к запрашивающему
  async approveLicense(
    ctx,
    dpsLogin,
    recipientLogin,
    requestIndex
  ) {
    const findedUserJSON = await ctx.stub.getState(recipientLogin);

    if (!findedUserJSON || findedUserJSON.length === 0) {
      throw new Error(`The User ${recipientLogin} does not exist`);
    }

    this.isDpsOfficer(ctx, dpsLogin);

    const findedUser = JSON.parse(findedUserJSON.toString());
    const findedRequest = findedUser.Requests[requestIndex];

    const findedLicense = driverLicenses.find(license =>
      license.number === findedRequest.LicenseNumber // Используем строгое сравнение
    );

    findedRequest.RequestStatus = this.requestStatus.APPROVED;

    const license = createLicense(findedLicense)

    findedUser.Licenses.push(license);
    await ctx.stub.putState(recipientLogin, Buffer.from(JSON.stringify(findedUser))
    );
  }

  // Функция для запроса автомобиля для пользователя
  // Принимает контекст, логин пользователя, категорию, цену авто, срок эксплуатации
  // В конце кладет запрос в массив запросов пользователя
  async requestVehicle(ctx, login, category, marketPrice, usabilityDate) {
    const findedUserJSON = await ctx.stub.getState(login);

    if (!findedUserJSON || findedUserJSON.length === 0) {
      throw new Error(`The User ${login} does not exist`);
    }

    const findedUser = JSON.parse(findedUserJSON.toString());
    const requestVehicle = createRequestVehicle(findedUser.Requests.length, category, marketPrice, usabilityDate)

    findedUser.Requests.push(requestVehicle);
    await ctx.stub.putState(login, Buffer.from(JSON.stringify(findedUser)));
  }

  // Функция для запроса автомобиля для пользователя
  // Принимает контекст, логин ДПСника, логин запрашивающего, индекс запроса
  // При успешном выполнении добавляет автомобиль к запрашивающему
  async approveVehicle(ctx, dpsLogin, recipientLogin, requestIndex) {
    const findedUserJSON = await ctx.stub.getState(recipientLogin);

    if (!findedUserJSON || findedUserJSON.length === 0) {
      throw new Error(`The User ${recipientLogin} does not exist`);
    }

    this.isDpsOfficer(ctx, dpsLogin);

    const findedUser = JSON.parse(findedUserJSON.toString());

    const findedRequest = findedUser.Requests[requestIndex];
    findedRequest.RequestStatus = this.requestStatus.APPROVED;

    const vehicle = createVehicle(findedRequest)

    findedUser.Vehicles.push(vehicle);
    await ctx.stub.putState(
      recipientLogin,
      Buffer.from(JSON.stringify(findedUser))
    );
  }

  // Функция для получения пользователя по логину
  // Принимает контекст и логин, возвращает обьект пользователя
  async getUser(ctx, login) {
    const findedUserJSON = await ctx.stub.getState(login)
    if (!findedUserJSON || findedUserJSON.length == 0) {
      throw new Error("Нету пользователя с таким логином")
    }
    const user = JSON.parse(findedUserJSON.toString())
    return user
  }

  // Функция для регистрации нового пользователя
  // Принимает контекст, логин, пароль, ключ, ФИО, роль, стаж вождения, баланс
  // При успешном выполнении кладет нового пользователя в чейнкод
  async register(
    ctx,
    login,
    password,
    key,
    fio,
    role,
    yearStartDriving,
    balance
  ) {
    const user = {
      Login: login,
      Password: password,
      Key: key,
      Fio: fio,
      Role: role,
      YearStartDriving: yearStartDriving,
      TotalUnpayedFines: 0,
      Balance: balance, //Profi tokens
      Requests: [],
      Licenses: [],
      Vehicles: []
    }
    this.userlogins.push(user.Login)
    this.token.Mint(ctx, user.Login, balance)

    await ctx.stub.putState(login, Buffer.from(JSON.stringify(user)))
  }

  async getAllUsers(ctx) {
    const users = [];
    for (const login of this.userlogins) {
      const user = await ctx.stub.getState(login);
      const strValue = JSON.parse(user.toString());
      users.push(strValue);
    }
    return users
  }

  async getTestTime() {
    const discountPeriod = 5 * 60 * 1000; // Первые 5 дней в миллисекундах
    const currentDate = new Date();

    const startTime = this.startAppDate; // Преобразуем в объект Date

    // Рассчитываем время, прошедшее с момента старта
    const elapsedTime = currentDate - startTime; // Время в миллисекундах
    const daysPassed = Math.floor(elapsedTime / (1000 * 60)); // Преобразуем в дни
    return daysPassed
  }

  async getAllLicenses() {
    return driverLicenses
  }

  async payFine(ctx, login) {
    const findedUserJSON = await ctx.stub.getState(login)
    if (!findedUserJSON || findedUserJSON.length == 0) {
      throw new Error("Нету пользователя с таким логином")
    }
    const user = JSON.parse(findedUserJSON.toString())

    const findedBankJSON = await ctx.stub.getState("Bank")
    const bank = JSON.parse(findedBankJSON.toString())

    const fineAmount = 10
    await this.token.Transfer(ctx, login, bank.Login, fineAmount);
    user.TotalUnpayedFines -= 1
    user.Balance -= fineAmount
    bank.Balance = await this.token.BalanceOf(ctx, "Bank")
    await ctx.stub.putState(login, Buffer.from(JSON.stringify(user)))
    await ctx.stub.putState("Bank", Buffer.from(JSON.stringify(bank)))
  }

  async issueFine(ctx, dpslogin, recipientLogin) {
    this.isDpsOfficer(ctx, dpslogin);

    const driverJSON = await ctx.stub.getState(recipientLogin); // Получаем данные водителя по ID
    if (!driverJSON || driverJSON.length === 0) {
      throw new Error(`Водитель с ID ${recipientLogin} не найден`); // Если водитель не найден, выбрасываем ошибку
    }

    const driver = JSON.parse(driverJSON.toString()); // Преобразуем данные водителя из JSON
    driver.TotalUnpayedFines += 1; // Увеличиваем количество неоплаченных штрафов

    await ctx.stub.putState(
      recipientLogin,
      Buffer.from(JSON.stringify(driver)) // Сохраняем обновленные данные водителя
    );

    return JSON.stringify(`Штраф выписан водителю ${driver.FullName}`); // Возвращаем сообщение о выписке штрафа
  }

  // Функция проверки на роль ДПСника
  // Принимает контекст и логин, если все верно, то ничего не возвращает
  async isDpsOfficer(ctx, login) {
    const findedUserJSON = await ctx.stub.getState(login);
    if (!findedUserJSON || findedUserJSON.length == 0) {
      throw new Error("Нету пользователя с таким логином");
    }

    const user = JSON.parse(findedUserJSON.toString());
    if (user.Role != this.userRoles.DPSOFFICER) {
      throw new Error(`Этот пользователь не ДПСник, его роль ${user.Role}`);
    }
  }
}
module.exports = SaveTrafic