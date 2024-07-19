// components/hoc/withAuth.tsx

import type { GetServerSideProps, GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";

const withAuth = (WrappedComponent: React.ComponentType<any>) => {
  const AuthenticatedComponent = (props: any) => {
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
  return async (context: GetServerSidePropsContext) => {
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
          ...result.props,
          session,
        },
      };
    }

    return result;
  };
};

export default withAuth;
