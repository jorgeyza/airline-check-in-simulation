import { describe, expect, it } from "vitest";

import { groupBy } from "~/utils/groupBy";
const passengers = [
  {
    passengerId: 415,
    dni: "139371904",
    name: "Gabriela",
    age: 73,
    country: "Perú",
    boardingPassId: 86,
    purchaseId: 158,
    seatTypeId: 3,
    seatId: null,
  },
  {
    passengerId: 515,
    dni: "41771513",
    name: "Camila",
    age: 80,
    country: "Chile",
    boardingPassId: 1,
    purchaseId: 69,
    seatTypeId: 2,
    seatId: null,
  },
  {
    passengerId: 499,
    dni: "287279248",
    name: "Maritza",
    age: 34,
    country: "Chile",
    boardingPassId: 595,
    purchaseId: 3,
    seatTypeId: 3,
    seatId: 101,
  },
  {
    passengerId: 198,
    dni: "130543670",
    name: "Gabriela",
    age: 78,
    country: "Perú",
    boardingPassId: 302,
    purchaseId: 158,
    seatTypeId: 3,
    seatId: null,
  },
  {
    passengerId: 11,
    dni: "967142004",
    name: "Víctor",
    age: 73,
    country: "Chile",
    boardingPassId: 504,
    purchaseId: 3,
    seatTypeId: 3,
    seatId: null,
  },
  {
    passengerId: 471,
    dni: "962026271",
    name: "Gustavo",
    age: 52,
    country: "México",
    boardingPassId: 371,
    purchaseId: 158,
    seatTypeId: 3,
    seatId: null,
  },
  {
    passengerId: 389,
    dni: "242779634",
    name: "Melisa",
    age: 77,
    country: "México",
    boardingPassId: 590,
    purchaseId: 69,
    seatTypeId: 2,
    seatId: null,
  },
  {
    passengerId: 85,
    dni: "589000509",
    name: "Lucas",
    age: 33,
    country: "Perú",
    boardingPassId: 452,
    purchaseId: 158,
    seatTypeId: 3,
    seatId: null,
  },
  {
    passengerId: 98,
    dni: "172426876",
    name: "Abril",
    age: 28,
    country: "Chile",
    boardingPassId: 496,
    purchaseId: 3,
    seatTypeId: 3,
    seatId: null,
  },
  {
    passengerId: 417,
    dni: "778997357",
    name: "Joaquín",
    age: 52,
    country: "Chile",
    boardingPassId: 507,
    purchaseId: 158,
    seatTypeId: 3,
    seatId: null,
  },
];

const expectedByPurchaseId = {
  "158": [
    {
      passengerId: 415,
      dni: "139371904",
      name: "Gabriela",
      age: 73,
      country: "Perú",
      boardingPassId: 86,
      purchaseId: 158,
      seatTypeId: 3,
      seatId: null,
    },
    {
      passengerId: 198,
      dni: "130543670",
      name: "Gabriela",
      age: 78,
      country: "Perú",
      boardingPassId: 302,
      purchaseId: 158,
      seatTypeId: 3,
      seatId: null,
    },
    {
      passengerId: 471,
      dni: "962026271",
      name: "Gustavo",
      age: 52,
      country: "México",
      boardingPassId: 371,
      purchaseId: 158,
      seatTypeId: 3,
      seatId: null,
    },
    {
      passengerId: 85,
      dni: "589000509",
      name: "Lucas",
      age: 33,
      country: "Perú",
      boardingPassId: 452,
      purchaseId: 158,
      seatTypeId: 3,
      seatId: null,
    },
    {
      passengerId: 417,
      dni: "778997357",
      name: "Joaquín",
      age: 52,
      country: "Chile",
      boardingPassId: 507,
      purchaseId: 158,
      seatTypeId: 3,
      seatId: null,
    },
  ],
  "69": [
    {
      passengerId: 515,
      dni: "41771513",
      name: "Camila",
      age: 80,
      country: "Chile",
      boardingPassId: 1,
      purchaseId: 69,
      seatTypeId: 2,
      seatId: null,
    },
    {
      passengerId: 389,
      dni: "242779634",
      name: "Melisa",
      age: 77,
      country: "México",
      boardingPassId: 590,
      purchaseId: 69,
      seatTypeId: 2,
      seatId: null,
    },
  ],
  "3": [
    {
      passengerId: 499,
      dni: "287279248",
      name: "Maritza",
      age: 34,
      country: "Chile",
      boardingPassId: 595,
      purchaseId: 3,
      seatTypeId: 3,
      seatId: 101,
    },
    {
      passengerId: 11,
      dni: "967142004",
      name: "Víctor",
      age: 73,
      country: "Chile",
      boardingPassId: 504,
      purchaseId: 3,
      seatTypeId: 3,
      seatId: null,
    },
    {
      passengerId: 98,
      dni: "172426876",
      name: "Abril",
      age: 28,
      country: "Chile",
      boardingPassId: 496,
      purchaseId: 3,
      seatTypeId: 3,
      seatId: null,
    },
  ],
};

describe("groupBy", () => {
  it("groups array elements by key", () => {
    expect(groupBy(passengers, "purchaseId")).toStrictEqual(
      expectedByPurchaseId
    );
  });

  it("should group the array by purchaseId", () => {
    const result = groupBy(passengers, "purchaseId");

    expect(Object.keys(result).length).toEqual(3);
    expect(result[158]).toHaveLength(5);
    expect(result[69]).toHaveLength(2);
    expect(result[3]).toHaveLength(3);
  });

  it("should group the array by seatTypeId", () => {
    const result = groupBy(passengers, "seatTypeId");

    expect(Object.keys(result).length).toEqual(2);
    expect(result[3]).toHaveLength(8);
    expect(result[2]).toHaveLength(2);
  });

  it("should group the array by country", () => {
    const result = groupBy(passengers, "country");

    expect(Object.keys(result).length).toEqual(3);
    expect(result["Chile"]).toHaveLength(5);
    expect(result["Perú"]).toHaveLength(3);
    expect(result["México"]).toHaveLength(2);
  });
});
