import { describe, expect, it } from "vitest";

import keysFromSnakeToCamel from "~/utils/keysFromSnakeToCamel";

describe("keysFromSnakeToCamel", () => {
  it("should convert all keys from snake_case to camelCase recursively", () => {
    const obj = {
      flight_id: 1,
      takeoff_date_time: 1688207580,
      takeoff_airport: "Aeropuerto Internacional Arturo Merino Benitez, Chile",
      landing_date_time: 1688221980,
      landing_airport: "Aeropuerto Internacional Jorge Cháve, Perú",
      airplane_id: 1,
      passengers: [
        {
          passenger_id: 90,
          dni: 983834822,
          name: "Marisol",
          age: 44,
          country: "México",
          boarding_pass_id: 24,
          purchase_id: 47,
          seat_type_id: 1,
          seat_id: 1,
        },
      ],
    };
    const expected = {
      flightId: 1,
      takeoffDateTime: 1688207580,
      takeoffAirport: "Aeropuerto Internacional Arturo Merino Benitez, Chile",
      landingDateTime: 1688221980,
      landingAirport: "Aeropuerto Internacional Jorge Cháve, Perú",
      airplaneId: 1,
      passengers: [
        {
          passengerId: 90,
          dni: 983834822,
          name: "Marisol",
          age: 44,
          country: "México",
          boardingPassId: 24,
          purchaseId: 47,
          seatTypeId: 1,
          seatId: 1,
        },
      ],
    };
    const result = keysFromSnakeToCamel(obj);
    expect(result).toEqual(expected);
  });

  it("should not modify the original object", () => {
    const obj = {
      snake_case_key: "value",
    };
    const result = keysFromSnakeToCamel(obj);
    expect(result).not.toBe(obj);
  });

  it("should handle empty objects", () => {
    const obj = {};
    const expected = {};
    const result = keysFromSnakeToCamel(obj);
    expect(result).toEqual(expected);
  });

  it("should handle null values", () => {
    const obj = {
      null_value: null,
    };
    const expected = {
      nullValue: null,
    };
    const result = keysFromSnakeToCamel(obj);
    expect(result).toEqual(expected);
  });

  it("should handle arrays of objects", () => {
    const obj = {
      users: [
        {
          seat_type_id: 1,
          name: "Primera clase",
        },
        {
          seat_type_id: 2,
          name: "Clase económica premium",
        },
        {
          seat_type_id: 3,
          name: "Clase económica",
        },
      ],
    };
    const expected = {
      users: [
        {
          seatTypeId: 1,
          name: "Primera clase",
        },
        {
          seatTypeId: 2,
          name: "Clase económica premium",
        },
        {
          seatTypeId: 3,
          name: "Clase económica",
        },
      ],
    };
    const result = keysFromSnakeToCamel(obj);
    expect(result).toEqual(expected);
  });
});
