import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

export interface AuthSession {
  spaceId: string;
  userId: string;
  firstName: string;
  lastName?: string;
  mqttAccount?: {
    username: string;
    password: string;
  };
}

const AuthContext = createContext<AuthSession | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    setSession({
      spaceId: '01HTQ9HBANAVTXG95AQWSWGXKK',
      userId: '01G65Z755AFWAKHE12NY0CQ9FH',
      firstName: 'Genie',
      lastName: 'Bot',
      mqttAccount: {
        username: '01G65Z755AFWAKHE12NY0CQ9FH',
        password: '01G65Z755AFWAKHE12NY0CQ9FH',
      },
    });

    return () => {
      setSession(null);
    };
  }, []);

  return (
    <AuthContext.Provider value={session}>{children}</AuthContext.Provider>
  );
};

export const useAuthSession = () => {
  const session = useContext(AuthContext);

  return session;
};
