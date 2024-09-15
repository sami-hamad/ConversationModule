import { Paper } from '@mantine/core';
import { LoginForm } from '../components/login/login_form';

export default function LoginPage() {
  return (
    <Paper style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <LoginForm />
    </Paper>
  );
}
