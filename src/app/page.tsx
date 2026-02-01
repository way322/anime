import Link from "next/link";
import Image from "next/image";

export default function Home() {
    return (
        <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-glow"></div>
                <div className="absolute top-40 -left-20 w-80 h-80 bg-violet-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-glow animation-delay-2000"></div>
                <div className="absolute -bottom-40 left-40 w-80 h-80 bg-fuchsia-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-glow animation-delay-4000"></div>
            </div>

            <div className="relative z-10 container mx-auto px-4 py-16">
                <nav className="flex justify-between items-center mb-20">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg flex items-center justify-center">
                            <Image
                                src="/fox.png"
                                alt="Kitsune Logo"
                                width={24}
                                height={24}
                                className="w-6 h-6"
                            />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                            Kitsune
                        </span>
                    </div>

                    <div className="flex gap-6">
                        <Link
                            href="/auth/login"
                            className="px-6 py-2 rounded-lg border border-purple-500/50 text-purple-300 hover:bg-purple-500/10 hover:text-purple-200 transition-all duration-300"
                        >
                            Вход
                        </Link>
                        <Link
                            href="/auth/register"
                            className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:from-purple-700 hover:to-violet-700 transition-all duration-300 shadow-lg shadow-purple-500/25"
                        >
                            Регистрация
                        </Link>
                    </div>
                </nav>

                <main className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <h1 className="text-6xl font-bold leading-tight">
                                <span className="block text-white">Kitsune</span>
                                <span className="block bg-gradient-to-r from-purple-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                                    Аниме библиотека
                                </span>
                            </h1>

                            <p className="text-xl text-gray-300 leading-relaxed">
                                Умная платформа для коллекционирования, отслеживания и обсуждения аниме.
                                Ваш персональный помощник в коллекции.
                            </p>

                            <div className="flex flex-wrap gap-4 pt-4">
                                <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-xl px-4 py-3">
                                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg flex items-center justify-center">
                                        <span className="text-sm font-bold">A</span>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-white">10K+</div>
                                        <div className="text-sm text-gray-400">Аниме в коллекции</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-xl px-4 py-3">
                                    <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
                                        <span className="text-sm font-bold">U</span>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-white">50K+</div>
                                        <div className="text-sm text-gray-400">Пользователей</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="relative bg-gradient-to-br from-gray-900/80 to-purple-900/30 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
                                <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl rotate-12 animate-float flex items-center justify-center">
                                    <Image
                                        src="/fox.png"
                                        alt="Logo"
                                        width={40}
                                        height={40}
                                        className="w-10 h-10"
                                    />
                                </div>

                                <div className="mb-8">
                                    <h3 className="text-2xl font-bold text-white mb-2">
                                        Присоединяйтесь к нам
                                    </h3>
                                    <p className="text-gray-400">
                                        Начните собирать свою коллекцию аниме
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Link
                                            href="/auth/login"
                                            className="py-4 px-6 bg-gradient-to-r from-purple-600/20 to-violet-600/20 border border-purple-500/30 rounded-xl text-center hover:from-purple-600/30 hover:to-violet-600/30 transition-all duration-300 group"
                                        >
                                            <div className="text-lg font-semibold text-white group-hover:text-purple-200">
                                                Вход
                                            </div>
                                            <div className="text-sm text-gray-400 group-hover:text-gray-300">
                                                В аккаунт
                                            </div>
                                        </Link>

                                        <Link
                                            href="/auth/register"
                                            className="py-4 px-6 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl text-center hover:from-purple-700 hover:to-violet-700 transition-all duration-300 shadow-lg shadow-purple-500/25 group"
                                        >
                                            <div className="text-lg font-semibold text-white">
                                                Регистрация
                                            </div>
                                            <div className="text-sm text-purple-200">
                                                Создать аккаунт
                                            </div>
                                        </Link>
                                    </div>

                                    <div className="text-center text-gray-500 text-sm">
                                        Или используйте социальные сети
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-20 grid md:grid-cols-3 gap-8">
                        {[
                            { icon: "Умные рекомендации", title: "Умные рекомендации", desc: "Подберем аниме по вашим вкусам" },
                            { icon: "Статистика", title: "Статистика просмотра", desc: "Отслеживайте свой прогресс и достижения" },
                            { icon: "Сообщество", title: "Сообщество", desc: "Общайтесь с другими энтузиастами" }
                        ].map((feature, i) => (
                            <div key={i} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-purple-500/30 transition-all duration-300">
                                <div className="text-sm font-bold text-purple-300 mb-4">{feature.icon}</div>
                                <h4 className="text-xl font-bold text-white mb-2">{feature.title}</h4>
                                <p className="text-gray-400">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}