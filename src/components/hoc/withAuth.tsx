// components/hoc/withAuth.tsx

import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";

const withAuth = (WrappedComponent: React.ComponentType) => {
  const AuthenticatedComponent = (props: any) => {
    return <WrappedComponent {...props} />;
  };

  const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
    const session = await getSession(context);

    if (!session || !session.user?.authorized) {
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

  return AuthenticatedComponent;
};

export const withAuthGetServerSideProps = (getServerSidePropsFunc?: GetServerSideProps) => {
    return async (context: GetServerSidePropsContext) => {
      // Fetch the session
      const session = await getSession(context);
  
      // Check if the user is authorized
      if (!session || !session.user?.authorized) {
        return {
          redirect: {
            destination: "/",
            permanent: false,
          },
        };
      }
  
      // Fetch additional data if needed
      const result = getServerSidePropsFunc ? await getServerSidePropsFunc(context) : { props: {} };
  
      // Return props or redirect
      if ('props' in result) {
        return {
          ...result,
          props: {
            ...result.props,
            session,
          },
        };
      }
  
      // If there is a redirect or notFound in the result, just return it
      return result;
    };
  };

export default withAuth;
