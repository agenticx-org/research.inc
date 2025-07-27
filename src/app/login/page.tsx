"use client";

import Waves from "@/components/animation/Waves";
import { Button } from "@/components/ui/button";
import { useAuthActions } from "@convex-dev/auth/react";
import { Shuffle, SpinnerGap } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

function getRandomColor() {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return `rgba(${r}, ${g}, ${b}, 1)`;
}

const LoginPage = () => {
  const [lineColor, setLineColor] = useState("rgba(265, 250, 247, 0.5)");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuthActions();

  const handleRandomizeColor = () => {
    setLineColor(getRandomColor());
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      signIn("google", {});
    } catch (error) {
      console.error("Google sign-in failed:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden lg:block bg-black">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >
          <Waves lineColor={lineColor} backgroundColor="#000" />
        </motion.div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-4 right-4 text-white hover:text-white/80 hover:bg-white/10"
          onClick={handleRandomizeColor}
        >
          <Shuffle className="size-4" weight="bold" />
        </Button>
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-[#0A0A0A] text-white border-l-[#2A2A2A] border-l">
        <div className="flex flex-1 items-center justify-center flex-col">
          <div className="w-full max-w-xs items-center justify-center gap-2 flex font-medium text-xl">
            <Image
              src={"/research-white.svg"}
              width={30}
              height={30}
              alt="Research.inc Logo"
            />
            Research.inc
          </div>
          <Button
            variant="default"
            className="w-full max-w-xs mt-5 flex items-center gap-3 h-11 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <SpinnerGap className="size-5 animate-spin" weight="bold" />
            ) : (
              <Image
                src="/google-g.svg"
                alt="Google Logo"
                width={18}
                height={18}
              />
            )}
            {isLoading ? "Signing in..." : "Continue with Google"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
