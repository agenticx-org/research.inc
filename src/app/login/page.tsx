"use client";

import Waves from "@/components/animation/Waves";

const LoginPage = () => {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden lg:block bg-black">
        <Waves lineColor="rgba(153, 69, 0, 1)" backgroundColor="#000" />
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">Login</div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
