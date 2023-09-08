import AccountService from "../src/AccountService";
import RideService from "../src/RideService";

describe("RideService", () => {
  it("Deve conseguir solicitar uma corrida", async () => {
    const inputAccount = {
      name: "John Doe",
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: "95818705552",
      isPassenger: true,
    };
    let accountService = new AccountService();
    let account = await accountService.signup(inputAccount);
    const input = {
      account_id: account.accountId,
      from: {
        lat: -23.60005,
        long: -46.72016,
      },
      to: {
        lat: -23.702658,
        long: -46.701929,
      },
    };

    const rideService = new RideService();
    const output = await rideService.requestRide(input);
    const ride = await rideService.getRide(output.rideId);
    expect(ride.passenger_id).toBe(input.account_id);
    expect(parseFloat(ride.from_lat)).toBe(input.from.lat);
    expect(parseFloat(ride.from_long)).toBe(input.from.long);
    expect(parseFloat(ride.to_lat)).toBe(input.to.lat);
    expect(parseFloat(ride.to_long)).toBe(input.to.long);
    expect(ride.status).toBe("requested");
  });

  it("Não deve conseguir solicitar uma corrida para um passageiro que já tem outra corrida solicitada", async () => {
    const inputAccount = {
      name: "John Doe",
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: "95818705552",
      isPassenger: true,
    };
    let accountService = new AccountService();
    let account = await accountService.signup(inputAccount);
    const input = {
      account_id: account.accountId,
      from: {
        lat: -23.60005,
        long: -46.72016,
      },
      to: {
        lat: -23.702658,
        long: -46.701929,
      },
    };

    const rideService = new RideService();
    await rideService.requestRide(input);

    await expect(() => rideService.requestRide(input)).rejects.toThrow(
      new Error("Passenger has another rice requested")
    );
  });

  it("Não deve conseguir solicitar uma corrida caso a conta não seja de um passageiro", async () => {
    const inputAccount = {
      name: "John Doe",
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: "95818705552",
      isPassenger: false,
    };
    let accountService = new AccountService();
    let account = await accountService.signup(inputAccount);
    const input = {
      account_id: account.accountId,
      from: {
        lat: -23.60005,
        long: -46.72016,
      },
      to: {
        lat: -23.702658,
        long: -46.701929,
      },
    };

    const rideService = new RideService();

    await expect(() => rideService.requestRide(input)).rejects.toThrow(
      new Error("Account is not passenger")
    );
  });

  it("Deve permitir que o motorista aceite uma corrida", async () => {
    const inputAccountPassenger = {
      name: "John Doe",
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: "95818705552",
      isPassenger: true,
    };

    const inputAccountDrive = {
      name: "John Doe",
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: "95818705552",
      carPlate: "AAA9999",
      isDriver: true,
    };
    let accountService = new AccountService();
    let accountPassenger = await accountService.signup(inputAccountPassenger);
    let accountDriver = await accountService.signup(inputAccountDrive);
    const input = {
      account_id: accountPassenger.accountId,
      from: {
        lat: -23.60005,
        long: -46.72016,
      },
      to: {
        lat: -23.702658,
        long: -46.701929,
      },
    };

    const rideService = new RideService();
    const output = await rideService.requestRide(input);

    await rideService.acceptRide(output.rideId, accountDriver.accountId);

    const ride = await rideService.getRide(output.rideId);

    expect(ride.status).toBe("accepted");
    expect(ride.driver_id).toBe(accountDriver.accountId);
  });

  it("Não deve permitir que uma conta que não seja motorista aceite a corrida", async () => {
    const inputAccountPassenger = {
      name: "John Doe",
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: "95818705552",
      isPassenger: true,
    };

    let accountService = new AccountService();
    let accountPassenger = await accountService.signup(inputAccountPassenger);
    const input = {
      account_id: accountPassenger.accountId,
      from: {
        lat: -23.60005,
        long: -46.72016,
      },
      to: {
        lat: -23.702658,
        long: -46.701929,
      },
    };

    const rideService = new RideService();
    const output = await rideService.requestRide(input);

    await expect(() =>
      rideService.acceptRide(output.rideId, accountPassenger.accountId)
    ).rejects.toThrow(new Error("Account is not driver"));
  });

  it("Não deve permitir que o motorista aceite uma corrida que não está com o status 'requested'", async () => {
    const inputAccountPassenger = {
      name: "John Doe",
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: "95818705552",
      isPassenger: true,
    };

    const inputAccountDrive = {
      name: "John Doe",
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: "95818705552",
      carPlate: "AAA9999",
      isDriver: true,
    };
    let accountService = new AccountService();
    let accountPassenger = await accountService.signup(inputAccountPassenger);
    let accountDriver = await accountService.signup(inputAccountDrive);
    const input = {
      account_id: accountPassenger.accountId,
      from: {
        lat: -23.60005,
        long: -46.72016,
      },
      to: {
        lat: -23.702658,
        long: -46.701929,
      },
    };

    const rideService = new RideService();
    const output = await rideService.requestRide(input);

    await rideService.acceptRide(output.rideId, accountDriver.accountId);

    await expect(() =>
      rideService.acceptRide(output.rideId, accountDriver.accountId)
    ).rejects.toThrow(new Error("Ride is not requested"));
  });

  it("Não deve permitir que o motorista aceite uma corrida se ele já aceitou outra ou está com uma corrida em andamento", async () => {
    const inputAccountPassengerFirstRide = {
      name: "John Doe",
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: "95818705552",
      isPassenger: true,
    };

    const inputAccountPassengerSecondRide = {
      name: "John Doe",
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: "95818705552",
      isPassenger: true,
    };

    const inputAccountDrive = {
      name: "John Doe",
      email: `john.doe${Math.random()}@gmail.com`,
      cpf: "95818705552",
      carPlate: "AAA9999",
      isDriver: true,
    };
    let accountService = new AccountService();
    let accountPassengerFirstRide = await accountService.signup(
      inputAccountPassengerFirstRide
    );
    let accountPassengerSecondRide = await accountService.signup(
      inputAccountPassengerSecondRide
    );
    let accountDriver = await accountService.signup(inputAccountDrive);

    const inputFirstRide = {
      account_id: accountPassengerFirstRide.accountId,
      from: {
        lat: -23.60005,
        long: -46.72016,
      },
      to: {
        lat: -23.702658,
        long: -46.701929,
      },
    };

    const inputSecondRide = {
      account_id: accountPassengerSecondRide.accountId,
      from: {
        lat: -23.60005,
        long: -46.72016,
      },
      to: {
        lat: -23.702658,
        long: -46.701929,
      },
    };

    const rideService = new RideService();
    const outputFirstRide = await rideService.requestRide(inputFirstRide);
    const outputSecondRide = await rideService.requestRide(inputSecondRide);

    await rideService.acceptRide(
      outputFirstRide.rideId,
      accountDriver.accountId
    );

    await expect(() =>
      rideService.acceptRide(outputSecondRide.rideId, accountDriver.accountId)
    ).rejects.toThrow(new Error("Driver is not available"));
  });
});

/* 

[ X ] deve verificar se o account_id tem is_driver true

[ X ] deve verificar se o status da corrida é "requested", se não for, lançar um erro

[   ] deve verificar se o motorista já tem outra corrida com status "accepted" ou "in_progress", se tiver lançar um erro

[ x ] deve associar o driver_id na corrida

[ x ] deve mudar o status para "accepted"


*/
