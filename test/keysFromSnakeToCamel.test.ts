import { describe, expect, it } from "vitest";

import { keysFromSnakeToCamel } from "~/utils/keysFromSnakeToCamel";

describe("keysFromSnakeToCamel", () => {
  it("should convert all keys from snake_case to camelCase recursively", () => {
    const obj = {
      flight_id: 1,
      takeoff_date_time: 1688207580,
      takeoff_airport: "Aeropuerto Internacional Arturo Merino Benitez, Chile",
      landing_date_time: 1688221980,
      landing_airport: "Aeropuerto Internacional Jorge Cháve, Perú",
      airplane_id: 1,
      address: {
        street_name: "Main St",
        postal_code: 12345,
      },
    };
    const expected = {
      flightId: 1,
      takeoffDateTime: 1688207580,
      takeoffAirport: "Aeropuerto Internacional Arturo Merino Benitez, Chile",
      landingDateTime: 1688221980,
      landingAirport: "Aeropuerto Internacional Jorge Cháve, Perú",
      airplaneId: 1,
      address: {
        streetName: "Main St",
        postalCode: 12345,
      },
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
});
