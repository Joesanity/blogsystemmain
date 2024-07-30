import { Outfit } from "next/font/google";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import Header from "~/components/global/header";
import Head from "next/head";


const outfit = Outfit({subsets: ['latin']});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <div className={outfit.className}>
      <Head>
        <title>Zeek Blog System</title>
        <meta name="description" content="Created and Designed by Joe" />
        <link rel="icon" href="/blogsm-fav.jpg" />
      </Head>
        <Header />
        <Component {...pageProps} />
      </div>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
