import React from "react";
import logo from "../../public/images/logo.png";

function Navbar() {
  return (
    <div>
      <header className="h-16 shadow-sm flex items-center ">
        <nav className="flex justify-between items-center w-9/12 mx-auto">
          <a href="">
            <img src={logo} alt="" />
          </a>
          <div className="flex items-center space-x-5">
            <ul className="sm:flex px-1 space-x-5 items-center text-base font-medium hidden">
              <li className="">
                <a href="">How it works?</a>
              </li>
              <li>
                <a href="">Features</a>
              </li>
              <li>
                <a href="">About Us</a>
              </li>
            </ul>
            <button className="font-medium px-5 py-1 bg-primary">Login</button>
          </div>
        </nav>
      </header>
    </div>
  );
}

export default Navbar;
