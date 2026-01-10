"use client";

import React, { useEffect, useState, useRef } from "react";
import { Camera, RotateCw, Trash2, CheckSquare, X, Check, AlertCircle, QrCode as QrIcon } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import toast from "react-hot-toast";
import api from "@/lib/axios";

// Helper to play a success beep using Web Audio API
const playScanSound = (type = "success") => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (type === "success") {
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } else {
      // Error sound (low buzz)
      oscillator.type = "sawtooth";
      oscillator.frequency.setValueAtTime(150, ctx.currentTime);
      oscillator.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.25);
    }
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

export default function QrScanner() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState("environment");
  const [history, setHistory] = useState([]);
  const [scanResult, setScanResult] = useState(null); // { type: 'success' | 'error' | 'warning', message: string, detail: any }
  const [manualCode, setManualCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const scannerRef = useRef(null);
  const regionId = "reader";

  // Fetch events on mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/organizer/events/");
        const payload = res?.data;
        let list = [];
        if (Array.isArray(payload)) list = payload;
        else if (Array.isArray(payload?.events)) list = payload.events;
        else if (Array.isArray(payload?.data)) list = payload.data;
        else if (payload?.results && Array.isArray(payload.results)) list = payload.results;

        setEvents(list);
      } catch (err) {
        toast.error("Failed to load events.");
        console.error(err);
      }
    };
    fetchEvents();
  }, []);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, []);

  const startScanning = async () => {
    if (!selectedEventId) {
      toast.error("Please select an event first.");
      return;
    }

    if (scannerRef.current) {
      // Already running logic if needed, but usually we just resume or ignore
      return;
    }

    try {
      const html5QrCode = new Html5Qrcode(regionId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: cameraFacingMode },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          // aspectRatio: 1.0, // Removed to allow full container fill
        },
        (decodedText) => {
          // Success callback
          handleScan(decodedText);
        },
        (errorMessage) => {
          // parse error, ignore mostly
        }
      );
      setIsScanning(true);
      setScanResult(null);
    } catch (err) {
      console.error("Failed to start scanner", err);
      toast.error("Could not start camera.");
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error("Failed to stop scanner", err);
      }
    }
  };

  const handleSwitchCamera = async () => {
    await stopScanning();
    setCameraFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
    // Restart logic is a bit complex immediately after stop, usually best to let user restart manually or use timeout
    // For specific requirement "Switch", we can try auto-restart
    setTimeout(() => {
      startScanning();
    }, 500);
  };

  const handleScan = async (decodedText) => {
    if (isProcessing) return;

    // Pause scanning to process result
    if (scannerRef.current) {
      scannerRef.current.pause();
    }

    setIsProcessing(true);
    await processCheckIn(decodedText);
  };

  const processCheckIn = async (ticketId) => {
    // Basic validation
    if (!ticketId) {
      setScanResult({ type: "error", message: "Invalid QR Code" });
      playScanSound("error");
      resumeScanningDelay();
      return;
    }

    try {
      const response = await api.post("/tickets/check-in/", {
        ticket_id: ticketId,
        event_id: selectedEventId
      });

      // Success Logic
      const data = response.data;
      playScanSound("success");
      setScanResult({
        type: "success",
        message: "Check-in Successful",
        detail: data.ticket?.student_full_name || "Attendee Verified"
      });
      addToHistory({
        id: ticketId,
        status: "success",
        timestamp: new Date(),
        detail: data.ticket?.student_full_name
      });
      toast.success("Ticket Checked In!");

    } catch (err) {
      playScanSound("error");
      const errorMsg = err.response?.data?.error || "Check-in failed";

      let type = "error";
      if (errorMsg.toLowerCase().includes("already checked in")) {
        type = "warning";
      }

      setScanResult({
        type: type,
        message: type === "warning" ? "Already Checked In" : "Check-in Failed",
        detail: errorMsg
      });

      addToHistory({
        id: ticketId,
        status: type,
        timestamp: new Date(),
        detail: errorMsg
      });
    } finally {
      resumeScanningDelay();
    }
  };

  const resumeScanningDelay = () => {
    setTimeout(() => {
      setIsProcessing(false);
      setScanResult(null); // Clear overlay
      if (scannerRef.current) {
        scannerRef.current.resume();
      }
    }, 3000); // 3 seconds to read result
  };

  const addToHistory = (entry) => {
    setHistory((prev) => [entry, ...prev]);
  };

  const handleManualVerify = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    if (!selectedEventId) {
      toast.error("Select an event first");
      return;
    }
    processCheckIn(manualCode.trim());
    setManualCode("");
  };

  return (
    <main className="min-h-screen text-slate-100 bg-linear-gradient(180deg,#020205_0%,_#000_100%) p-6">
      <div className="max-w-5xl mx-auto">
        <div
          className="rounded-2xl overflow-hidden border"
          style={{
            borderColor: "rgba(148,163,184,0.04)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.012), rgba(255,255,255,0.01))",
            backdropFilter: "blur(6px)",
          }}
        >
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-xl font-semibold text-slate-100">
                  QR Scanner
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Scan ticket QR codes for check-in.
                </p>
              </div>

              {/* Event Selector */}
              <div className="w-full md:w-64">
                <select
                  className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                >
                  <option value="">-- Select Event --</option>
                  {events.map(ev => (
                    <option key={ev.event_id || ev.id} value={ev.event_id || ev.id}>
                      {ev.title || ev.name || "Unnamed Event"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 mb-4">
              {!isScanning ? (
                <button
                  onClick={startScanning}
                  disabled={!selectedEventId}
                  className="px-4 py-2 rounded-md font-semibold text-sm bg-purple-600 hover:bg-purple-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  Start Camera
                </button>
              ) : (
                <button
                  onClick={stopScanning}
                  className="px-4 py-2 rounded-md font-semibold text-sm bg-red-600 hover:bg-red-700 text-white transition flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Stop
                </button>
              )}

              <button
                onClick={handleSwitchCamera}
                disabled={!isScanning}
                className="px-3 py-2 rounded-md border border-slate-700 hover:bg-slate-800 text-sm text-slate-200 flex items-center gap-2 disabled:opacity-50"
              >
                <RotateCw className="h-4 w-4" />
                Switch Cam
              </button>

              <button
                onClick={() => setHistory([])}
                className="px-3 py-2 rounded-md border border-slate-700 hover:bg-slate-800 text-sm text-slate-200 flex items-center gap-2 ml-auto"
              >
                <Trash2 className="h-4 w-4" />
                Clear History
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="flex justify-center lg:col-span-2 bg-black/20 rounded-xl p-4 border border-white/5">
                <div
                  className="relative rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-800"
                  style={{
                    width: "100%",
                    maxWidth: "400px",
                    height: "300px",
                  }}
                >
                  {/* Scanner Container */}
                  <div id={regionId} className="w-full h-400"></div>

                  {/* Placeholder when not scanning */}
                  {!isScanning && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 z-10">
                      <div className="text-center text-slate-500">
                        <QrIcon className="h-200 w-16 mx-auto mb-2 opacity-20" />
                        <p>Camera is off</p>
                      </div>
                    </div>
                  )}

                  {/* Result Overlay */}
                  {scanResult && (
                    <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md animate-in fade-in zoom-in duration-200 ${scanResult.type === 'success' ? 'bg-green-500/20' :
                      scanResult.type === 'warning' ? 'bg-yellow-500/20' : 'bg-red-500/20'
                      }`}>
                      <div className={`h-20 w-20 rounded-full flex items-center justify-center mb-4 ${scanResult.type === 'success' ? 'bg-green-500 text-white' :
                        scanResult.type === 'warning' ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                        {scanResult.type === 'success' ? <Check className="h-10 w-10" /> :
                          scanResult.type === 'warning' ? <AlertCircle className="h-10 w-10" /> : <X className="h-10 w-10" />}
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-1">{scanResult.message}</h2>
                      <p className="text-white/80">{scanResult.detail}</p>
                    </div>
                  )}

                  {/* Scan Line Animation - Vertical */}
                  {isScanning && !scanResult && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-[250px] h-[250px] border-2 border-purple-500/30 rounded-lg relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-purple-500 shadow-[0_0_15px_#a855f7] animate-[scan_2s_ease-in-out_infinite]"></div>
                      </div>
                      {/* Darken area outside scan box */}
                      <div className="absolute inset-0 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] z-0 rounded-lg"></div>
                    </div>
                  )}
                </div>
              </div>

              <aside className="rounded-lg border border-slate-800 p-4 bg-slate-900/30 flex flex-col h-[500px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-slate-100">
                    Scan History
                  </h3>
                  <div className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded-full">{history.length}</div>
                </div>

                <div className="flex-1 overflow-auto space-y-2 pr-1 custom-scrollbar">
                  {history.length === 0 ? (
                    <div className="text-sm text-slate-500 text-center py-8">No scans yet.</div>
                  ) : (
                    history.map((scan, i) => (
                      <div key={i} className={`p-3 rounded-md border text-left ${scan.status === 'success' ? 'border-green-500/20 bg-green-500/5' :
                        scan.status === 'warning' ? 'border-yellow-500/20 bg-yellow-500/5' :
                          'border-red-500/20 bg-red-500/5'
                        }`}>
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-xs font-bold uppercase ${scan.status === 'success' ? 'text-green-400' :
                            scan.status === 'warning' ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                            {scan.status === 'success' ? 'Verified' : scan.status === 'warning' ? 'Warning' : 'Failed'}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {scan.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-sm text-slate-200 font-medium truncate" title={scan.detail}>
                          {scan.detail || scan.id}
                        </div>
                        <div className="text-xs text-slate-500 truncate font-mono mt-1">
                          ID: {scan.id}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800">
                  <label className="text-xs text-slate-400 block mb-2">Manual Entry</label>
                  <form onSubmit={handleManualVerify} className="flex gap-2">
                    <input
                      placeholder="Enter ticket code..."
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      className="flex-1 rounded-md bg-transparent border border-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-purple-500 focus:outline-none"
                    />
                    <button
                      className="px-3 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white text-sm flex items-center gap-2 disabled:opacity-50"
                      type="submit"
                      disabled={isProcessing || !manualCode || !selectedEventId}
                    >
                      <CheckSquare className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </main>
  );
}