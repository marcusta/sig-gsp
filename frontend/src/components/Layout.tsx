import React from "react";
import { Link, Outlet } from "react-router-dom";
import UploadButton from "./UploadButton";
import { Button } from "./ui/button";

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-emerald-600">
      <header className="bg-white bg-opacity-10 backdrop-blur-md shadow-md">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary-foreground">
              Golf App
            </h1>
            <ul className="flex space-x-4">
              <li>
                <Button
                  asChild
                  variant={"outline"}
                  className="bg-white bg-opacity-20 text-white hover:bg-opacity-30"
                >
                  <Link to="/courses">View courses</Link>
                </Button>
              </li>
              <li>
                <UploadButton />
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
