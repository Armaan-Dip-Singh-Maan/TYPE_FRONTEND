import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../socket.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";

export default function Home() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  useEffect(() => { setName(localStorage.getItem("playerName") || ""); }, []);

  const ensureConnected = () =>
    new Promise((resolve, reject) => {
      if (socket.connected) return resolve();
      console.log("[home] socket not connected; connecting…");
      socket.connect();
      const onOk = () => { socket.off("connect_error", onErr); resolve(); };
      const onErr = (e) => { socket.off("connect", onOk); reject(e); };
      socket.once("connect", onOk);
      socket.once("connect_error", onErr);
      setTimeout(() => {
        socket.off("connect", onOk);
        socket.off("connect_error", onErr);
        reject(new Error("socket connect timeout"));
      }, 3000);
    });

  const createRoom = async () => {
    const n = name.trim();
    if (!n) { alert("Enter your name"); return; }
    try {
      await ensureConnected();
      console.log("[home] emitting create_room", { name: n });
      const ack = await new Promise((resolve, reject) => {
        let done = false;
        const tid = setTimeout(() => {
          if (!done) { done = true; reject(new Error("No ack from server (create_room)")); }
        }, 4000);
        socket.emit("create_room", { name: n }, (resp) => {
          if (done) return;
          done = true;
          clearTimeout(tid);
          resolve(resp);
        });
      });

      console.log("[home] create_room ack", ack);
      if (ack?.error) { alert(ack.error); return; }

      localStorage.setItem("playerName", n);
      navigate("/room", { state: { code: ack.code, name: n, isHost: true } });
    } catch (e) {
      console.error("[home] create_room failed", e);
      alert(`Create room failed: ${e.message || e}`);
    }
  };

  const joinRoom = async () => {
    const n = name.trim();
    const c = code.trim().toUpperCase();
    if (!n) { alert("Enter your name"); return; }
    if (!c) { alert("Enter the room code"); return; }
    try {
      await ensureConnected();
      console.log("[home] emitting join_room", { code: c, name: n });
      const ack = await new Promise((resolve, reject) => {
        let done = false;
        const tid = setTimeout(() => {
          if (!done) { done = true; reject(new Error("No ack from server (join_room)")); }
        }, 4000);
        socket.emit("join_room", { code: c, name: n }, (resp) => {
          if (done) return;
          done = true;
          clearTimeout(tid);
          resolve(resp);
        });
      });

      console.log("[home] join_room ack", ack);
      if (ack?.error) { alert(ack.error); return; }

      localStorage.setItem("playerName", n);
      navigate("/room", { state: { code: c, name: n, isHost: false } });
    } catch (e) {
      console.error("[home] join_room failed", e);
      alert(`Join failed: ${e.message || e}`);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Create a room</CardTitle>
          <CardDescription>Up to 5 players. Share the code.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="text-sm opacity-80">Your name</label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Armaan" />
          <Button onClick={createRoom}>Create room</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Join a room</CardTitle>
          <CardDescription>Enter the code your friend shared.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="text-sm opacity-80">Your name</label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Armaan" />
          <label className="text-sm opacity-80">Room code</label>
          <Input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="e.g. ABXYZ" />
          <Button variant="secondary" onClick={joinRoom}>Join room</Button>
        </CardContent>
      </Card>
    </div>
  );
}
