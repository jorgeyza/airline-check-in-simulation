import { z } from "zod";
import { useMemo, useState } from "react";
import { Field, Form } from "houseform";

import { api } from "~/utils/api";
import { capitalLetterToNumber } from "~/utils/capitalLetterToNumber";

interface FormType {
  search: string;
}

function Airplane() {
  const [flightId, setFlightId] = useState("");

  const oneFlight = api.simulation.getSimulation.useQuery({
    flight_id: Number(flightId),
  });

  const airplaneId = oneFlight.data?.data?.airplaneId;

  const {
    data: allSeatsByAirplaneId,
    status,
    error,
  } = api.seat.getAllByAirplaneId.useQuery(
    {
      airplane_id: airplaneId as number,
    },
    { enabled: !!airplaneId }
  );

  const { data: oneAirplane } = api.airplane.getOne.useQuery(
    {
      airplane_id: airplaneId as number,
    },
    { enabled: !!airplaneId }
  );

  const allSeats = useMemo(
    () =>
      allSeatsByAirplaneId?.map((seat) => {
        return {
          ...seat,
          seat_column: capitalLetterToNumber(seat.seat_column),
        };
      }) ?? [],
    [allSeatsByAirplaneId]
  );

  const seatColorVariants: { [key: number]: string } = {
    1: "h-6 w-6 border-2 border-gray-400 bg-blue-500",
    2: "h-6 w-6 border-2 border-gray-400 bg-orange-500",
    3: "h-6 w-6 border-2 border-gray-400 bg-white",
  };

  function handleOnSubmit(values: FormType) {
    setFlightId(values.search);
  }

  return (
    <section className="flex flex-col gap-y-8 text-white" data-test="airplane">
      <Form<FormType> onSubmit={(values) => handleOnSubmit(values)}>
        {({ isValid, submit }) => (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
            className="flex gap-x-2"
          >
            <Field<FormType["search"]>
              name="search"
              initialValue={""}
              onBlurValidate={z.enum(["1", "2", "3", "4"])}
            >
              {({ value, setValue, onBlur, errors }) => (
                <div>
                  <input
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent py-2 px-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-purple-400 dark:text-slate-50 dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onBlur={onBlur}
                    placeholder="Enter flight id..."
                  />
                  {errors.map((error) => (
                    <p className="text-red-400" key={error}>
                      Only 1,2,3 or 4
                    </p>
                  ))}
                </div>
              )}
            </Field>
            <button
              className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 py-2 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 active:scale-95 disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-slate-100 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100 dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900 dark:data-[state=open]:bg-slate-800"
              type="submit"
              disabled={!isValid}
            >
              Search
            </button>
          </form>
        )}
      </Form>
      {!flightId ? (
        <div>Welcome, start by searching your flight</div>
      ) : status === "loading" ? (
        <p className="text-white">Simulation loading...</p>
      ) : status === "error" ? (
        <p className="text-red-400">Error: {error.message}</p>
      ) : (
        <>
          <aside
            className="flex flex-col gap-y-4 rounded-md border-2 border-gray-400 p-4"
            data-test="seats-legend"
          >
            <h2 className="font-bold" data-test="airplane-model">
              {oneAirplane?.name} | {allSeats?.length} passengers
            </h2>
            <div className="flex flex-col gap-y-1">
              <div className="flex items-center gap-x-2">
                <div className="h-4 w-4 border-2 border-gray-400 bg-blue-500" />
                <p>First class</p>
              </div>
              <div className="flex items-center gap-x-2">
                <div className="h-4 w-4 border-2 border-gray-400 bg-orange-400" />
                <p>Economic premium</p>
              </div>
              <div className="flex items-center gap-x-2">
                <div className="h-4 w-4 border-2 border-gray-400 bg-white" />
                <p>Economic</p>
              </div>
            </div>
          </aside>
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${
                flightId === "1" ? 7 : 9
              }, minmax(0, 24px))`,
              gridTemplateRows: `repeat(${
                flightId === "1" ? 34 : 31
              }, minmax(0, 24px))`,
            }}
          >
            {allSeats
              ? allSeats.map((seat) => {
                  return (
                    <div
                      key={seat.seat_id}
                      className={seatColorVariants[seat.seat_type_id]}
                      style={{
                        gridColumn: `${seat.seat_column} / span 1`,
                        gridRow: `${seat.seat_row} / span 1`,
                      }}
                    />
                  );
                })
              : "Loading tRPC query..."}
          </div>
          <pre className="text-2xl text-white">
            {allSeatsByAirplaneId
              ? JSON.stringify(allSeatsByAirplaneId, null, 2)
              : "Loading tRPC query..."}
          </pre>
        </>
      )}
    </section>
  );
}

export default Airplane;
