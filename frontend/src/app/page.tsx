'use client';

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Função de login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (username === 'admin' && password === '1234') {
      setLoggedIn(true);
      setError('');
    } else {
      setError('Usuário ou senha incorretos');
    }
  };

  // Tela de login
  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] px-6">
        <motion.form
          onSubmit={handleLogin}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-[#1e293b]/90 via-[#0f172a]/90 to-[#1e293b]/90 p-8 rounded-3xl shadow-2xl w-full max-w-md flex flex-col gap-6 border border-cyan-400/30 backdrop-blur-md"
        >
          <div className="flex justify-center mb-4">
            <Image
              src="/arquivo.jpeg"
              alt="Logo da Oficina"
              width={140}
              height={90}
              className="drop-shadow-xl"
            />
          </div>
          <h1 className="text-3xl font-extrabold text-center text-cyan-400">Bem-vindo!</h1>
          <p className="text-gray-300 text-center mb-4">Faça login para acessar o sistema</p>
          {error && <p className="text-red-500 text-center font-semibold">{error}</p>}
          <input
            type="text"
            placeholder="Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="p-4 rounded-xl bg-gray-800/70 border border-cyan-400/40 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-4 rounded-xl bg-gray-800/70 border border-cyan-400/40 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
            required
          />
          <button
            type="submit"
            className="bg-cyan-500 hover:bg-cyan-600 transition-colors p-4 rounded-xl font-bold text-white shadow-lg hover:shadow-xl"
          >
            Entrar
          </button>
        </motion.form>
      </div>
    );
  }

  // Tela principal após login
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white relative">

      {/* Botão de Logout */}
      <button
        onClick={() => setLoggedIn(false)}
        className="absolute top-5 right-5 bg-red-500 hover:bg-red-600 transition-colors px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl"
      >
        Sair
      </button>

      {/* Logo, Título e Relógio */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between w-full max-w-3xl mb-12"
      >
        <div className="flex items-center gap-4">
          <div className="flex justify-center">
            <Image
              src="/arquivo.jpeg"
              alt="Logo da Oficina"
              width={150}
              height={100}
              className="drop-shadow-xl"
            />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-cyan-400">
              OficinaPro
            </h1>
            <p className="text-gray-300 mt-2 text-sm sm:text-base">
              Sistema interno da sua oficina de motos
            </p>
          </div>
        </div>

        <Clock />
      </motion.header>

      {/* Módulos */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl"
      >
        <ModuleButton
          href="/clientes"
          icon="🧑‍🔧"
          title="Clientes"
          color="from-cyan-500 to-blue-600"
        />
        <ModuleButton
          href="/servicos"
          icon="💪"
          title="Serviços"
          color="from-green-500 to-emerald-600"
        />
        <ModuleButton
          href="/contas"
          icon="💰"
          title="Contas"
          color="from-rose-500 to-pink-600"
        />
        <ModuleButton
          href="/relatorio"
          icon="📊"
          title="Relatórios"
          color="from-amber-400 to-orange-500"
        />
      </motion.main>

      {/* Rodapé */}
      <footer className="mt-16 border-t border-gray-700 pt-4 text-gray-400 text-sm flex flex-col md:flex-row justify-between items-center">
        <span>© {new Date().getFullYear()} OficinaPro</span>
        <span className="mt-2 md:mt-0">
          Desenvolvido por{" "}
          <a
            href="https://www.linkedin.com/in/francis-toledo-461033260/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 font-bold hover:underline"
          >
            Toledo Software
          </a>
        </span>
      </footer>
    </div>
  );
}

// Clock
function Clock() {
  const [time, setTime] = useState<string>(() => formatTime(new Date()));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(formatTime(new Date()));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="
        flex items-center gap-1.5 sm:gap-2
        bg-white/10 backdrop-blur-md rounded-xl
        px-3 sm:px-5 py-1
        shadow-lg
        min-w-[110px] sm:min-w-[150px]
        select-none
        max-w-full
        overflow-x-auto
      "
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
      </svg>
      <span
        className="
          font-mono text-cyan-300 font-semibold tracking-widest
          text-xs sm:text-sm md:text-base
          whitespace-nowrap
          max-w-full
          overflow-hidden
          text-ellipsis
        "
        title={time}
      >
        {time}
      </span>
    </div>
  );
}

// Formatação de hora
function formatTime(date: Date): string {
  return date.toLocaleTimeString("pt-BR", { hour12: false });
}

// Botões de módulos
type ModuleProps = {
  href: string;
  title: string;
  icon: string;
  color: string;
};

function ModuleButton({ href, title, icon, color }: ModuleProps) {
  return (
    <Link
      href={href}
      className={`bg-gradient-to-br ${color} text-white font-semibold p-6 rounded-2xl flex flex-col items-center justify-center text-center transition-transform hover:scale-105 shadow-lg shadow-black/20 hover:shadow-black/30`}
    >
      <div className="text-4xl mb-2 drop-shadow-md">{icon}</div>
      <span className="text-lg tracking-wide">{title}</span>
    </Link>
  );
}
