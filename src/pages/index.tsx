import { type NextPage } from "next";
import Head from "next/head";
import Airplane from "~/components/Airplane";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Check-in status</title>
        <meta name="description" content="Check your flight seats status" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Airline <span className="text-[hsl(280,100%,70%)]">Check-in</span>{" "}
            Simulator
          </h1>
          <Airplane />
        </div>
      </main>
    </>
  );
};

export default Home;
