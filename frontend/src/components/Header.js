import React from "react";
import letters from "./sigepletterscool.png"; // Replace with your image path

function Header() {
  return (
    <div className="flex items-center justify-center border-solid border-b-4 border-red-500 bg-black px-4">
      <div className="text-center bg-black p-6 max-w-sm">
        {/* App Image */}
        <img
          src={letters}
          alt="SigEp Letters"
          className="w-300 h-300 mx-auto mb-4 object-contain"
        />

        {/* App Title */}
      </div>
    </div>
  );
}

export default Header;