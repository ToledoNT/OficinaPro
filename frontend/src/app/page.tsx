"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white">
      {/* Logo e Título */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="flex justify-center mb-4">
          <Image
            src="/moto-logo.svg"
            alt="Logo da Oficina"
            width={72}
            height={72}
            className="drop-shadow-xl"
          />
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-cyan-400">
          OficinaPro
        </h1>
        <p className="text-gray-300 mt-2 text-sm sm:text-base">
          Sistema interno da sua oficina de motos
        </p>
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
          href="/dividas"
          icon="💰"
          title="Dívidas"
          color="from-rose-500 to-pink-600"
        />
        <ModuleButton
          href="/relatorios"
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