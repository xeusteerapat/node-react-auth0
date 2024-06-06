import axios from 'axios';
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

const domain = 'YOUR_AUTH0_DOMAIN';
const clientId = 'YOUR_AUTH0_CLIENT_ID';
const audience = 'YOUR_AUTH0_AUDIENCE'; // your API domain
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

  useEffect(() => {
    const handleAuth = async () => {
      const code = new URLSearchParams(window.location.search).get('code');

      if (code && !accessToken) {
        console.log('code is', code);
        const response = await axios.post(`https://${domain}/oauth/token`, {
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: 'YOUR_AUTH0_CLIENT_SECRET', // you can get this from the Auth0 dashboard
          audience,
        });

        setAccessToken(response.data.access_token);
        window.history.replaceState({}, document.title, '/');
      }
    };

    handleAuth();
  }, [accessToken]);

  const login = () => {
    const authUrl = `https://${domain}/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=openid profile email&audience=${audience}`;

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
