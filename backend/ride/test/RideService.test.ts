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
});
