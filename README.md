# Airline Check-in Status Simulator

This a challenge for the "Developer" position at Bsale.

Web app for reviewing check-in status of specified flight. Uses a MySQL db filled with flights data. Users are able to:

- See a user interface that show the current check-in of the flight.
- See relevant data such as landing airport or passenger info.
- Request info to the database with an OpenAPI compliant REST API.
- Receive visual feedback for user input or server errors.

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`. To start project use `pnpm dev`.

## Envs

- DATABASE_URL => A MySQL connection URL

## Stack

- [Next.js](https://nextjs.org)
- [Prisma](https://prisma.io)
- [Tailwind](https://tailwindcss.com/)
- [tRPC](https://trpc.io)
- [MySQL](https://www.mysql.com/)
- [Amazon RDS](https://aws.amazon.com/rds/?nc2=type_a)
