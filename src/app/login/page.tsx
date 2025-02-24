"use client";

import Waves from "@/components/animation/Waves";
import { Button } from "@/components/ui/button";
import { Shuffle } from "@phosphor-icons/react";
import Image from "next/image";
import { useState } from "react";

function getRandomColor() {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return `rgba(${r}, ${g}, ${b}, 1)`;
}

const LoginPage = () => {
  const [lineColor, setLineColor] = useState("rgba(153, 69, 0, 1)");

  const handleRandomizeColor = () => {
    setLineColor(getRandomColor());
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden lg:block bg-black">
        <Waves lineColor={lineColor} backgroundColor="#000" />
        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-4 right-4 text-white hover:text-white/80 hover:bg-white/10"
          onClick={handleRandomizeColor}
        >
          <Shuffle className="size-4" weight="bold" />
        </Button>
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center flex-col">
          <div className="w-full max-w-xs items-center gap-1 flex flex-col font-medium text-xl">
            <Image
              src={"/research.svg"}
              width={30}
              height={30}
              alt="Research.inc Logo"
            />
            Research.inc
          </div>
          <Button
            variant="outline"
            className="w-full max-w-xs mt-8 flex items-center gap-3 h-11"
            onClick={() => {}}
          >
            <Image
              src="/google-g.svg"
              alt="Google Logo"
              width={18}
              height={18}
            />
            Continue with Google
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
