import crypto from "crypto";
import pgp from "pg-promise";
import CpfValidator from "./CpfValidator";

export default class RideService {
  async requestRide(input: any) {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    try {
      const rideId = crypto.randomUUID();
      const date = new Date();
      const [checkIsPassenger] = await connection.query(
        "select * from cccat13.account where account_id = $1",
        [input.account_id]
      );

      if (checkIsPassenger && !checkIsPassenger.is_passenger)
        throw new Error("Account is not passenger");

      const [existingRideRequested] = await connection.query(
        "select * from cccat13.ride where passenger_id = $1 AND status != 'completed'",
        [input.account_id]
      );
      if (existingRideRequested)
        throw new Error("Passenger has another rice requested");

      await connection.query(
        "insert into cccat13.ride (ride_id, passenger_id, status, from_lat, from_long, to_lat, to_long, date) values ($1, $2, $3, $4, $5, $6, $7, $8)",
        [
          rideId,
          input.account_id,
          "requested",
          input.from.lat,
          input.from.long,
          input.to.lat,
          input.to.long,
          date,
        ]
      );
      return {
        rideId,
      };
    } finally {
      await connection.$pool.end();
    }
  }

  async getRide(rideId: string) {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    const [ride] = await connection.query(
      "select * from cccat13.ride where ride_id = $1",
      [rideId]
    );
    await connection.$pool.end();
    return ride;
  }

  async acceptRide(rideId: string, driverId: string) {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    try {
      const [ride] = await connection.query(
        "select * from cccat13.ride where ride_id = $1",
        [rideId]
      );

      if (ride.status !== "requested") throw new Error("Ride is not requested");

      const [checkIsDriver] = await connection.query(
        "select * from cccat13.account where account_id = $1",
        [driverId]
      );

      if (checkIsDriver && !checkIsDriver.is_driver)
        throw new Error("Account is not driver");

      const [existingRideRequested] = await connection.query(
        "select * from cccat13.ride where driver_id = $1 AND (status = 'accepted' OR status = 'in_progress')",
        [driverId]
      );

      if (existingRideRequested) throw new Error("Driver is not available");

      await connection.query(
        "UPDATE cccat13.ride SET driver_id = $1, status = $2 WHERE ride_id = $3 ",
        [driverId, "accepted", rideId]
      );
    } finally {
      await connection.$pool.end();
    }
  }
}
