import { useAuth } from '../auth/AuthContext';

const Login = () => {
  const { login } = useAuth();

  return (
    <div>
      <button onClick={login}>Log In</button>
    </div>
  );
};

export default Login;
