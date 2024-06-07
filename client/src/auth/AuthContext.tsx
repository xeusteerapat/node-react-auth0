import axios from 'axios';
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

const redirectUri = window.location.origin + '/callback';

console.log(redirectUri);

interface AuthContextProps {
  accessToken: string | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const hasFetchToken = useRef(false);

  useEffect(() => {
    if (hasFetchToken.current) return;

    hasFetchToken.current = true;

    const handleAuth = async () => {
      try {
        const code = new URLSearchParams(window.location.search).get('code');

        if (code && !accessToken) {
          console.log('code is', code);
          const response = await axios({
            method: 'post',
            url: `http://localhost:5001/auth/${code}`,
            headers: {
              'Access-Control-Allow-Credentials': true,
            },
          });
          console.log('accessToken is', accessToken);

          setAccessToken(response.data.access_token);
          window.history.replaceState({}, document.title, '/');
        }
      } catch (error) {
        console.log(error);
        hasFetchToken.current = false;
      }
    };

    handleAuth();
  }, [accessToken]);

  const login = () => {
    const authUrl = 'http://localhost:5001/login';
    console.log(authUrl);
    window.location.href = authUrl;
  };

  const logout = () => {
    setAccessToken(null);
    window.location.href = window.location.origin;
  };

  return (
    <AuthContext.Provider value={{ accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
