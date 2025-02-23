"use client";

const Chat: React.FC = () => {
  return (
    <>
      <div className="flex-grow flex-shrink-0 h-[51px] w-full bg-white z-[2]"></div>
      <div className="flex-grow flex-shrink relative w-full h-[calc(100vh-51px)]">
        <div className="border-b border-b-default-200 flex items-center justify-between bg-white gap-x-3 px-3 h-[46px] relative">
          Agent
        </div>
        <div className="flex-grow flex-shrink w-full h-full overflow-y-scroll relative"></div>
        <div className="w-full px-2 pt-2 absolute bottom-0 pb-2 space-y-2">
          <div className="relative flex flex-col">Test</div>
        </div>
      </div>
    </>
  );
};

export default Chat;
