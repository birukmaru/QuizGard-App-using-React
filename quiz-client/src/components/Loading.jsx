import React from "react";

function Loading() {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-zinc-900 bg-opacity-70 backdrop-filter backdrop-blur-sm z-50">
      <h1 className="text-lg text-white">
        Stay Seated, Stay Sharp, Starting Quiz in a moment!
      </h1>
    </div>
  );
}

export default Loading;
