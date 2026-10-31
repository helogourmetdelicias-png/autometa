import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Montante - PDV</h1>
        <p className="text-lg text-gray-600 mb-8">
          Sistema completo de Ponto de Venda para o seu negócio
        </p>
        <Link
          href="/marketing"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          📱 Gestão de Marketing
        </Link>
      </div>
    </main>
  );
}
