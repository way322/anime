import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const user = session.user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
        
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 flex items-center justify-center shadow-lg mb-4">
            <Image
              src="/fox.png"
              alt="Avatar"
              width={48}
              height={48}
            />
          </div>

          <h1 className="text-3xl font-bold text-white">
            {user.name ?? "Пользователь"}
          </h1>

          <p className="text-gray-300 mt-1">{user.email}</p>

          <div className="mt-6 grid grid-cols-2 gap-4 w-full">
            <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
              <div className="text-2xl font-bold text-white">0</div>
              <div className="text-sm text-gray-400">Избранное</div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
              <div className="text-2xl font-bold text-white">0</div>
              <div className="text-sm text-gray-400">Оценки</div>
            </div>
          </div>

          <Link
            href="/api/auth/signout"
            className="mt-8 w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold text-center hover:from-red-600 hover:to-pink-600 transition-all shadow-lg shadow-red-500/25"
          >
            Выйти из аккаунта
          </Link>
        </div>
      </div>
    </div>
  );
}
