// components/hoc/withAuth.tsx

import type { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { getSession } from "next-auth/react";
import { Session } from "next-auth";
import { PropsWithChildren } from "react";

type WithAuthProps = {
  session: Session | null;
};

const withAuth = (WrappedComponent: React.ComponentType<PropsWithChildren<WithAuthProps>>) => {
  const AuthenticatedComponent = (props: PropsWithChildren<WithAuthProps>) => {
    return <WrappedComponent {...props} />;
  };

  const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
    const session = await getSession(context);

    if (!session?.user?.authorized) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    return {
      props: { session },
    };
  };

  AuthenticatedComponent.getServerSideProps = getServerSideProps;

  return AuthenticatedComponent;
};

export const withAuthGetServerSideProps = (getServerSidePropsFunc?: GetServerSideProps) => {
  return async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<WithAuthProps>> => {
    const session = await getSession(context);

    if (!session?.user?.authorized) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    const result = getServerSidePropsFunc ? await getServerSidePropsFunc(context) : { props: {} };

    if ('props' in result) {
      return {
        ...result,
        props: {
          ...(result.props as object),
          session,
        },
      };
    }

    return result;
  };
};

export default withAuth;
