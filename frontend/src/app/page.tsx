'use client';

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white">
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
      <footer className="mt-16 text-xs text-gray-400">
        © {new Date().getFullYear()} OficinaPro · Desenvolvido por Francis
      </footer>
    </div>
  );
}

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

function formatTime(date: Date): string {
  return date.toLocaleTimeString("pt-BR", { hour12: false });
}

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
