
import React from 'react';
import Layout from '@/components/Layout';
import { LoginForm } from '@/components/AuthForms';

const LoginPage: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-md mx-auto pt-8">
        <LoginForm />
      </div>
    </Layout>
  );
};

export default LoginPage;
