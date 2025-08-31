import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import socket from "../socket.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import PlayerRow from "../components/PlayerRow.jsx";
import TypingArea from "../components/TypingArea.jsx";

export default function Room() {
  const state = useLocation().state || {};
  const initialCode = state.code;
  const initialName = state.name || localStorage.getItem("playerName") || "";
  const [code, setCode] = useState(initialCode || "");
  const [name, setName] = useState(initialName || "");

  const [hostId, setHostId] = useState(null);
  const [started, setStarted] = useState(false);
  const [startAt, setStartAt] = useState(null);
  const [durationSec, setDurationSec] = useState(60);
  const [passage, setPassage] = useState("");

  const [players, setPlayers] = useState([]);
  const [results, setResults] = useState(null);

  const meIdRef = useRef(socket.id);
  useEffect(() => { meIdRef.current = socket.id; }, []);

  useEffect(() => {
    function onState(s) {
      setHostId(s.hostId); setStarted(s.started); setStartAt(s.startAt); setDurationSec(s.durationSec);
      setPlayers(s.players);
    }
    function onStart({ startAt, durationSec, passage }) {
      setStartAt(startAt); setDurationSec(durationSec); setPassage(passage); setResults(null);
    }
    function onProgress({ players, passageLength }) { setPlayers(players.map(p => ({ ...p, passageLength }))); }
    function onResult(payload) { setResults(payload); }

    socket.on("room_state", onState);
    socket.on("race_start", onStart);
    socket.on("room_progress", onProgress);
    socket.on("race_result", onResult);

    return () => {
      socket.off("room_state", onState);
      socket.off("race_start", onStart);
      socket.off("room_progress", onProgress);
      socket.off("race_result", onResult);
    };
  }, []);

  const isHost = hostId === meIdRef.current;

  const joinIfNeeded = () => {
    if (code && name && !players.find(p => p.id === meIdRef.current)) {
      socket.emit("join_room", { code: code.toUpperCase(), name }, (resp) => {
        if (resp?.error) return alert(resp.error);
      });
    }
  };

  useEffect(() => { if (code && name) joinIfNeeded(); }, [code, name]);

  const handleStart = () => socket.emit("start_race", { code, durationSec }, (resp) => resp?.error && alert(resp.error));
  const handleProgress = ({ correctChars, totalTyped, elapsedMs }) => started && socket.emit("progress_update", { code, correctChars, totalTyped, elapsedMs });
  const handleFinish = ({ wpm, accuracy, elapsedMs }) => socket.emit("finish", { code, stats: { wpm, accuracy, elapsedMs } });

  const copyCode = async () => { try { await navigator.clipboard.writeText(code); alert("Code copied"); } catch {} };

  const length = passage?.length || players[0]?.passageLength || 1;
  const sortedPlayers = [...players].sort((a,b) => (b.correctChars||0)-(a.correctChars||0));

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3 space-y-4">
        <Card>
          <div className="flex items-center justify-between">
            <div className="p-4">
              <div className="text-sm opacity-70">Room</div>
              <div className="text-2xl font-bold tracking-tight">{code || "-"}</div>
            </div>
            <div className="p-4 flex items-center gap-2">
              <Button variant="secondary" onClick={copyCode}>Copy code</Button>
              {isHost && !started && <Button onClick={handleStart}>Start race</Button>}
            </div>
          </div>
          {!name || !code ? (
            <CardContent className="grid gap-3">
              <CardDescription>Join a room by entering your name and code.</CardDescription>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-sm opacity-80 mb-1">Your name</div>
                  <Input value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                  <div className="text-sm opacity-80 mb-1">Room code</div>
                  <Input value={code} onChange={e => setCode(e.target.value.toUpperCase())} />
                </div>
              </div>
              <Button onClick={joinIfNeeded}>Join</Button>
            </CardContent>
          ) : null}
        </Card>

        {passage && (
          <Card>
            <CardHeader>
              <CardTitle>Race</CardTitle>
              <CardDescription>{durationSec}s • starts at {startAt ? new Date(startAt).toLocaleTimeString() : "—"}</CardDescription>
            </CardHeader>
            <CardContent>
              <TypingArea passage={passage} durationSec={durationSec} startAt={startAt} disabledUntilStart={true} onProgress={handleProgress} onFinish={handleFinish} />
            </CardContent>
          </Card>
        )}

        {results && (
          <Card>
            <CardHeader><CardTitle>Results</CardTitle></CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {results.results.map((r, i) => (
                  <li key={r.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/20 text-primary grid place-items-center font-semibold">{r.name.slice(0,1)}</div>
                      <span className="font-medium">{i+1}. {r.name}</span>
                    </div>
                    <div className="text-sm opacity-80">WPM <span className="font-semibold">{r.wpm}</span> • Acc <span className="font-semibold">{r.accuracy}%</span></div>
                  </li>
                ))}
              </ol>
              <div className="mt-4 flex gap-2">
                {isHost && <Button onClick={handleStart}>Start again</Button>}
                <Button variant="secondary" onClick={() => setResults(null)}>Hide results</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="lg:col-span-2 space-y-3">
        <Card>
          <CardHeader>
            <CardTitle>Players</CardTitle>
            <CardDescription>Max 5 players.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {sortedPlayers.length === 0 && <div className="opacity-70">Waiting for players…</div>}
            {sortedPlayers.map(p => (
              <PlayerRow key={p.id} name={p.name} percent={(100 * (p.correctChars || 0)) / (length || 1)} highlight={p.id === meIdRef.current} />
            ))}
          </CardContent>
        </Card>

        {isHost && !started && (
          <Card>
            <CardHeader>
              <CardTitle>Host controls</CardTitle>
              <CardDescription>Pick duration and hit start.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <Button variant={durationSec===30?"default":"secondary"} onClick={() => setDurationSec(30)}>30s</Button>
              <Button variant={durationSec===60?"default":"secondary"} onClick={() => setDurationSec(60)}>60s</Button>
              <Button variant={durationSec===120?"default":"secondary"} onClick={() => setDurationSec(120)}>120s</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
