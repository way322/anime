"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";

export default function SocialButtons({ isLogin = true }) {
  const handleSocialLogin = (provider: string) => {
    signIn(provider, { callbackUrl: "/" });
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        type="button"
        onClick={() => handleSocialLogin("google")}
        className="group relative bg-white/10 border border-white/20 rounded-xl p-4 flex items-center justify-center gap-3 hover:bg-white/20 transition-all duration-300 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/10"
      >
        <div className="relative w-6 h-6">
          <Image
            src="/google.png"
            alt="Google"
            fill
            className="object-contain"
          />
        </div>
        <span className="text-white font-medium group-hover:text-purple-200 transition-colors duration-300">
          Google
        </span>
      </button>

      <button
        type="button"
        onClick={() => handleSocialLogin("yandex")}
        className="group relative bg-white/10 border border-white/20 rounded-xl p-4 flex items-center justify-center gap-3 hover:bg-white/20 transition-all duration-300 hover:border-yellow-400/50 hover:shadow-lg hover:shadow-yellow-500/10"
      >
        <div className="relative w-6 h-6">
          <Image
            src="/yandex.png"
            alt="Yandex"
            fill
            className="object-contain"
          />
        </div>
        <span className="text-white font-medium group-hover:text-yellow-200 transition-colors duration-300">
          Яндекс
        </span>
      </button>
    </div>
  );
}