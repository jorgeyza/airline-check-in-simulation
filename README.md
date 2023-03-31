# Airline Check-in Simulator

![Vercel](https://therealsujitk-vercel-badge.vercel.app/?app=airline-check-in-simulation)

This a challenge for the "Developer" position at Bsale.

Web app for automating check-in of specified flight. Uses a MySQL db hosted with the Amazon RDS service, filled with flights data with a very small set of assigned seats. Users are able to:

- See a user interface with the flight check-in status before and after running the automation.
- See relevant data such as landing airport or passenger info.
- Request info to the database with an OpenAPI compliant REST API.
- Receive visual feedback for user input or server errors.

The check-in automation has the following constraints:

- If a user already assigned her seat, it cannot be changed.
- All minor passengers must stay next to at least one of their adult companions.
- If a purchase has, for example, 4 boarding passes, try as much as possible that the seats that are assigned are together, or are very close (either in the row or in the column).
- If a boarding pass belongs to the "economy" class, a seat from another class cannot be assigned.

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`. To start project use `pnpm dev`. You can run unit tests using `pnpm test`

You can see the [live application here](https://airline-check-in-simulation.vercel.app/)

## IMPORTANT

- To call the API, make a GET request to `https://airline-check-in-simulation.vercel.app/api/flights/{flight_id}/passengers`.
- There is a user interface at `https://airline-check-in-simulation.vercel.app/` which right now serves mostly for debugging purposes.

## Envs

- DATABASE_URL => A MySQL connection URL

## Stack

- [Next.js](https://nextjs.org)
- [Prisma](https://prisma.io)
- [Tailwind](https://tailwindcss.com/)
- [tRPC](https://trpc.io)
- [MySQL](https://www.mysql.com/)
- [Amazon RDS](https://aws.amazon.com/rds/?nc2=type_a)
