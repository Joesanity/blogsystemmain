import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Router, { useRouter } from "next/router";
import { useState, useEffect } from "react";
import BackButton from "~/components/buttons/backbutton";
import { api } from "~/utils/api";
import withAuth, { withAuthGetServerSideProps } from "~/components/hoc/withAuth";

function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const url = searchParams.get("url") || "NULL";

  if (url === "NULL") {
    router.push("/add-website");
  }

  const {
    data: getWebsite,
    isLoading,
    isError,
    error,
  } = api.website.getWebsite.useQuery({ url });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="h-[100vh] bg-slate-50 py-10">
      {isLoading && <h1>Loading...</h1>}
      {isError && <h1>Error Occurred</h1>}
      {getWebsite && (
        <div className="mx-10 rounded-lg bg-white p-8 shadow-xl">
          <BackButton />
          <h1 className="mb-4 text-3xl font-bold text-purple-700">
            {getWebsite.url}
          </h1>
          <h2 className="mb-2 text-2xl font-semibold">Details:</h2>
          <ul className="space-y-1 text-gray-700">
            <li>
              <span className="font-medium">Company Name:</span>{" "}
              {getWebsite.companyName}
            </li>
            <li>
              <span className="font-medium">Email Address:</span>{" "}
              {getWebsite.emailAddress}
            </li>
            <li>
              <span className="font-medium">Phone Number:</span>{" "}
              {getWebsite.phoneNumber}
            </li>
            <li>
              <span className="font-medium">Stock Category:</span>{" "}
              {getWebsite.stockCategory}
            </li>
            <li>
              <span className="font-medium">Username:</span>{" "}
              {getWebsite.username}
            </li>
            <li>
              <span className="font-medium">Application Password:</span>{" "}
              {getWebsite.applicationPassword}
            </li>
            <li>
              <span className="font-medium">Keywords:</span>{" "}
              {getWebsite.keywords}
            </li>
            <li>
              <span className="font-medium">Locations:</span>{" "}
              {getWebsite.locations}
            </li>
            <li>
              <span className="font-medium">Monthly Blog Amount:</span>{" "}
              {getWebsite.blogAmountMonthly}
            </li>
            <li>
              <span className="font-medium">Starting Blog Date:</span>{" "}
              {formatDate(getWebsite.blogStartingDate)}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export const getServerSideProps = withAuthGetServerSideProps();

export default withAuth(Home);
