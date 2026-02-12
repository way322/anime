// src/app/components/Header.tsx
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "../../app/api/auth/[...nextauth]/route";

export default async function Header() {
  const session = await getServerSession(authOptions);
  const isAuthed = !!session;
  const isAdmin = session?.user?.role === "admin";

  return (
    <header className="bg-transparent py-4 px-6 fixed top-0 left-0 w-full z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg flex items-center justify-center">
            <Image src="/fox.png" alt="Kitsune Logo" width={24} height={24} />
          </div>
          <span className="text-2xl font-bold text-white">Kitsune</span>
        </Link>

        <nav className="flex space-x-6">
          <Link href="/catalog" className="text-white hover:text-purple-400 transition-colors">
            Каталог
          </Link>

          {isAdmin && (
            <Link href="/admin" className="text-white hover:text-purple-400 transition-colors">
              Админка
            </Link>
          )}

          {isAuthed ? (
            <>
              <Link href="/profile" className="text-white hover:text-purple-400 transition-colors">
                Профиль
              </Link>
              <Link
                href="/api/auth/signout?callbackUrl=/"
                className="text-white hover:text-purple-400 transition-colors"
              >
                Выход
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-white hover:text-purple-400 transition-colors">
                Вход
              </Link>
              <Link
                href="/auth/register"
                className="text-white hover:text-purple-400 transition-colors"
              >
                Регистрация
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
