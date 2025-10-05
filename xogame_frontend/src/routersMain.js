import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Play from "./pages/Play";
import Replay from "./pages/Replay";
import AllGame from "./pages/AllGame";

export default function RoutesMain() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play/:gameId/:size" element={<Play />} />
        <Route path="/replay/:gameId" element={<Replay />} />
        <Route path="/allgames" element={<AllGame />} />
      </Routes>
    </BrowserRouter>
  );
}
