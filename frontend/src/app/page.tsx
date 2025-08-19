'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, LogIn, Loader2, User } from 'lucide-react';
import { ApiService } from './api/api-requests';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const apiService = new ApiService();

  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          router.replace('/home');
        } catch (err) {
          localStorage.removeItem('user');
        }
      }
    };
    checkAuth();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.username.trim()) {
      return setError('Informe seu usuário.');
    }
    if (formData.password.length < 6) {
      return setError('A senha deve ter pelo menos 6 caracteres.');
    }

    try {
      setLoading(true);
      const response = await apiService.loginUser(formData.username, formData.password);
      
      if (!response) {
        throw new Error('No response from server');
      }

      if (response.user) {
        const userData = {
          id: response.user.id,
          username: response.user.user,
        };

        localStorage.setItem('user', JSON.stringify(userData));
        
        router.push('/home');
      } else {
        setError(response.message || 'Authentication failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err instanceof Error) {
        setError(err.message || 'Erro ao efetuar login. Tente novamente.');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#0b0f14] text-gray-200 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="absolute -inset-1 rounded-3xl bg-gradient-to-b from-blue-500/20 to-transparent blur-2xl"
          aria-hidden
        />

        <motion.section
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative rounded-3xl border p-6 sm:p-8 backdrop-blur bg-[#0f1720]/95 border-gray-800/15 shadow-2xl"
        >
          <header className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">Bem-vindo de volta</h1>
            <p className="mt-1 text-sm text-gray-400">
              Entre para continuar gerenciando seus serviços.
            </p>
          </header>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-4">
              <label className="block text-sm">
                <span className="mb-1 inline-flex items-center gap-2 text-gray-300">
                  <User className="h-4 w-4 opacity-80" /> Usuário
                </span>
                <input
                  type="text"
                  name="username"
                  autoComplete="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Seu Usuário"
                  className="mt-1 w-full rounded-xl border bg-transparent px-3 py-2.5 text-sm outline-none transition placeholder:text-gray-500 border-gray-800/15 focus:ring-2 focus:ring-blue-500/40"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 inline-flex items-center gap-2 text-gray-300">
                  <Lock className="h-4 w-4 opacity-80" /> Senha
                </span>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    name="password"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="mt-1 w-full rounded-xl border bg-transparent px-3 py-2.5 pr-10 text-sm outline-none transition placeholder:text-gray-500 border-gray-800/15 focus:ring-2 focus:ring-blue-500/40"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-2 my-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    aria-label={showPwd ? 'Esconder senha' : 'Mostrar senha'}
                    onClick={() => setShowPwd(!showPwd)}
                  >
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-xs text-gray-400 select-none">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="h-4 w-4 rounded border-gray-800/15 bg-transparent" 
                />
                Lembrar-me
              </label>
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500/30 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Entrar
                </>
              )}
            </button>
          </form>
        </motion.section>

        <footer className="mt-6 text-center text-[10px] text-gray-500">
          © {new Date().getFullYear()} OficinaPro · Todos os direitos reservados
        </footer>
      </div>
    </main>
  );
}