"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { 
  Camera, 
  RotateCw, 
  Trash2, 
  CheckSquare, 
  X, 
  Check, 
  AlertCircle, 
  QrCode as QrIcon,
  History,
  User,
  Ticket,
  Maximize2,
  Minimize2,
  ChevronRight,
  ShieldCheck,
  Search
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import CustomDropdown from "@/components/ui/CustomDropdown";

// --- Audio Feedback Helpers ---

const playBeep = (type = "success") => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "success") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === "error") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch (e) {
    console.error("Audio beep failed", e);
  }
};

const vocalize = (text, type = "success") => {
  playBeep(type);
  try {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.1;
    utterance.volume = 0.9;
    
    const voices = window.speechSynthesis.getVoices();
    const preferredVoices = ["Microsoft Aria", "Google UK English Female", "Samantha", "Victoria"];
    let selectedVoice = voices.find(v => preferredVoices.some(pv => v.name.includes(pv)));
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith("en") && v.name.toLowerCase().includes("female"));
    }
    if (selectedVoice) utterance.voice = selectedVoice;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.error("Vocalize failed", e);
  }
};

// --- Utils ---

const cleanTicketId = (rawId, isManual = false) => {
  if (!rawId || typeof rawId !== 'string') return rawId;
  let trimmed = rawId.trim();
  if (trimmed.startsWith("QR-")) trimmed = trimmed.substring(3);
  
  if (isManual && !trimmed.startsWith("ticket:")) {
    if (trimmed.startsWith("TC-") || /^[A-Z0-9]+-[A-Z0-9]+$/.test(trimmed)) {
      return `ticket:${trimmed}`;
    }
  }
  return trimmed;
};

// --- Components ---

export default function QrScanner() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState("environment");
  const [history, setHistory] = useState([]);
  const [scanResult, setScanResult] = useState(null); 
  const [manualCode, setManualCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("scanner"); // "scanner" or "manual"

  const scannerRef = useRef(null);
  const regionId = "reader";

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/organizer/events/");
        const payload = res?.data;
        let list = Array.isArray(payload) ? payload : (payload?.events || payload?.data || payload?.results || []);
        setEvents(list);
      } catch (err) {
        toast.error("Failed to load events.");
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, []);

  // Camera management effect
  useEffect(() => {
    let mounted = true;

    const initCamera = async () => {
      // 1. If we should be scanning but haven't started yet
      if (isScanning && activeTab === "scanner" && !scannerRef.current) {
        // Wait for DOM
        await new Promise(r => setTimeout(r, 150));
        if (!mounted) return;

        // Check if element exists
        const element = document.getElementById(regionId);
        if (!element) {
          console.error("Scanner element not found in DOM");
          toast.error("Scanner element not ready. Please try again.");
          setIsScanning(false);
          return;
        }

        console.log("Initializing camera...");
        try {
          const scanner = new Html5Qrcode(regionId);
          scannerRef.current = scanner;
          
          console.log("Starting Html5Qrcode scanner...");
          // Use simple constraints - just environment camera
          await scanner.start(
            { facingMode: "environment" },
            { 
              fps: 10, 
              qrbox: { width: 250, height: 250 }
            },
            (text) => {
              console.log("QR code detected:", text);
              handleScan(text);
            },
            (errorMessage) => {
              // Scan errors are normal, don't log them
            }
          );
          console.log("✓ Camera started successfully and displaying");
        } catch (err) {
          console.error("❌ Html5Qrcode initialization failed:", err);
          if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
              toast.error("Camera permission denied during initialization. Please refresh the page and allow access.", { duration: 6000 });
          } else if (err?.name === "NotFoundError" || err?.name === "DevicesNotFoundError") {
              toast.error("No camera found on your device.");
          } else if (err?.name === "NotReadableError") {
              toast.error("Camera is already in use. Please close other apps and try again.");
          } else if (err?.message?.includes("Permission")) {
              toast.error("Camera access is blocked. Please check your browser settings.", { duration: 6000 });
          } else {
              toast.error("Could not start camera: " + (err?.message || "Unknown error"));
          }
          setIsScanning(false);
          scannerRef.current = null;
        }
      } 
      // 2. If we are scanning but switched tabs or turned it off
      else if (scannerRef.current && (!isScanning || activeTab !== "scanner")) {
        await stopScanning();
      }
    };

    initCamera();
    return () => { mounted = false; };
  }, [isScanning, activeTab, cameraFacingMode]);

  const startScanning = async () => {
    if (!selectedEventId) {
      toast.error("Please select an event first.");
      return;
    }

    console.log("Requesting camera access...");
    console.log("Current URL:", window.location.href);
    console.log("Protocol:", window.location.protocol);
    
    // Check if we're on a secure context
    if (window.location.protocol !== 'https:' && !window.location.hostname.includes('localhost')) {
      toast.error("Camera requires HTTPS or localhost. Current site is not secure.", { duration: 8000 });
      return;
    }
    
    // Check if getUserMedia is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("Camera API not available in this browser. Please use a modern browser.");
      return;
    }

    // Request camera access directly with basic constraints
    try {
        // Try with just video: true first (simplest constraint)
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        console.log("✓ Camera permission granted, stream obtained:", stream);
        console.log("Video tracks:", stream.getVideoTracks());
        
        // Permission granted! Stop this stream so Html5Qrcode can take over
        stream.getTracks().forEach(track => {
            console.log("Stopping track:", track.label);
            track.stop();
        });
        
        setIsScanning(true);
        setScanResult(null);
        console.log("✓ isScanning set to true");
    } catch (err) {
        console.error("❌ Camera access failed:", err.name, err.message, err);
        
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
            // Provide detailed instructions
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const isWindows = navigator.platform.toUpperCase().indexOf('WIN') >= 0;
            
            let instructions = "Camera permission denied. ";
            
            if (isWindows) {
                instructions += "Windows: 1) Press Windows key + I → Privacy → Camera → Allow apps to access camera. 2) In your browser, click the lock/camera icon in address bar → Camera → Allow. 3) Refresh page (F5).";
            } else if (isMac) {
                instructions += "Mac: 1) System Preferences → Security & Privacy → Camera → Enable for your browser. 2) In browser, click the lock icon → Camera → Allow. 3) Refresh page.";
            } else {
                instructions += "1) Check system settings to allow camera access for your browser. 2) In browser, click lock/camera icon in address bar → Camera → Allow. 3) Refresh page.";
            }
            
            console.error("PERMISSION DENIED - Follow these steps:", instructions);
            toast.error(instructions, { duration: 10000 });
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
            toast.error("No camera detected on this device.");
        } else if (err.name === "NotReadableError") {
            toast.error("Camera is in use by another app. Please close other apps and refresh the page.");
        } else if (err.name === "TypeError") {
            toast.error("Camera API not available. Make sure you're using HTTPS or localhost.");
        } else {
            toast.error("Camera error: " + err.message + " (See console for details)");
        }
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
        console.error("Stop error", err);
      }
    }
    // Also ensure state is reset if scanner ref was missing
    setIsScanning(false);
  };

  const handleSwitchCamera = async () => {
    if (scannerRef.current) {
      await stopScanning();
    }
    setCameraFacingMode(prev => prev === "environment" ? "user" : "environment");
    // The useEffect will automatically restart the camera because cameraFacingMode changed
    setIsScanning(true);
  };

  const handleScan = async (decodedText) => {
    if (isProcessing) return;
    if (scannerRef.current) scannerRef.current.pause();
    setIsProcessing(true);
    await processCheckIn(decodedText);
  };

  const processCheckIn = async (rawCode, isManual = false) => {
    const ticketId = cleanTicketId(rawCode, isManual);
    if (!ticketId) {
      finishProcess({ type: "error", message: "Invalid Code", voice: "Invalid Code" });
      return;
    }

    try {
      const response = await api.post("/tickets/check-in/", {
        ticket_id: ticketId,
        event_id: selectedEventId
      });

      const data = response.data;
      const attendeeName = data.ticket?.student_full_name || "Attendee";
      const category = data.ticket?.category_name || "Regular";
      
      finishProcess({ 
        type: "success", 
        message: "Verified", 
        detail: attendeeName,
        extra: category,
        voice: `Verified. Welcome ${attendeeName}`
      });

      addToHistory({
        id: ticketId,
        status: "success",
        timestamp: new Date(),
        name: attendeeName,
        category: category
      });
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Check-in failed";
      let type = "error";
      let voiceMsg = "Check in failed";

      if (errorMsg.toLowerCase().includes("already checked in")) {
        type = "warning";
        voiceMsg = "Already used";
      } else if (errorMsg.toLowerCase().includes("not found")) {
        voiceMsg = "Ticket not found";
      }

      finishProcess({ 
        type, 
        message: type === "warning" ? "Used" : "Failed", 
        detail: errorMsg,
        voice: voiceMsg 
      });

      addToHistory({
        id: ticketId,
        status: type,
        timestamp: new Date(),
        name: "Unknown",
        detail: errorMsg
      });
    }
  };

  const finishProcess = ({ type, message, detail, extra, voice }) => {
    setScanResult({ type, message, detail, extra });
    vocalize(voice, type === "success" ? "success" : (type === "warning" ? "warning" : "error"));
    
    setTimeout(() => {
      setIsProcessing(false);
      setScanResult(null);
      if (scannerRef.current && isScanning) {
        scannerRef.current.resume();
      }
    }, 2500);
  };

  const addToHistory = (entry) => {
    setHistory(prev => [entry, ...prev].slice(0, 50));
  };

  const handleManualVerify = (e) => {
    e.preventDefault();
    if (!manualCode.trim() || !selectedEventId || isProcessing) return;
    processCheckIn(manualCode.trim(), true);
    setManualCode("");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans selection:bg-rose-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <p className="text-gray-500 font-medium ml-1">Event Entry Management System</p>
          </div>

          <div className="w-full md:w-80">
            <CustomDropdown
              value={selectedEventId}
              onChange={(val) => setSelectedEventId(val)}
              options={events.map(ev => ({
                value: ev.event_id || ev.id,
                label: ev.name || ev.title,
                icon: Ticket
              }))}
              placeholder="Select Event to Check-in"
              searchable={true}
            />
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Scanner Section */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Tabs */}
            <div className="flex bg-[#0F0F0F] p-1.5 rounded-2xl w-fit border border-white/5">
              <button 
                onClick={() => setActiveTab("scanner")}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                  activeTab === "scanner" ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20" : "text-gray-500 hover:text-white"
                )}
              >
                <Camera className="w-4 h-4" /> Camera
              </button>
              <button 
                onClick={() => setActiveTab("manual")}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                  activeTab === "manual" ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20" : "text-gray-500 hover:text-white"
                )}
              >
                <Ticket className="w-4 h-4" /> Manual
              </button>
            </div>

            <div className="relative flex-1 bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl group min-h-[400px] md:min-h-[500px]">
              
              <AnimatePresence mode="wait">
                {activeTab === "scanner" ? (
                  <motion.div 
                    key="scanner-v"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center"
                  >
                    {!isScanning ? (
                      <div className="text-center space-y-6 px-10">
                        <div className="w-24 h-24 bg-rose-600/10 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
                          <Camera className="w-10 h-10 text-rose-500" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold italic tracking-wide">Ready to Verify?</h3>
                          <p className="text-gray-500 max-w-xs text-sm">Start the camera to begin scanning attendee QR codes instantly.</p>
                        </div>
                        <button 
                          onClick={startScanning}
                          className="bg-rose-600 hover:bg-rose-700 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-600/30 transition-all hover:scale-105 active:scale-95"
                        >
                          Initialize Camera
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-full min-h-[400px] md:min-h-[500px]">
                        <div 
                          id={regionId} 
                          className="w-full h-full"
                          style={{ 
                            minHeight: '400px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }} 
                        />
                      </div>
                    )}

                    {/* Scanning Overlay (only when scanning & no result) */}
                    {isScanning && !scanResult && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="relative w-64 h-64 border-2 border-rose-500/50 rounded-3xl overflow-hidden">
                          <div className="absolute inset-0 bg-rose-500/5 transition-opacity" />
                          <div className="absolute -inset-2 border-2 border-rose-500/20 rounded-[2.5rem] animate-pulse" />
                          {/* Animated Scan Line */}
                          <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_15px_rgba(244,63,94,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div 
                    key="manual-v"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                    className="absolute inset-0 flex flex-col items-center justify-center p-8"
                  >
                    <div className="max-w-md w-full bg-[#0F0F0F] border border-white/5 p-10 rounded-[2rem] shadow-xl space-y-8">
                       <div className="flex items-center gap-4">
                         <div className="bg-rose-500/20 p-3 rounded-2xl"><Ticket className="text-rose-500" /></div>
                         <h3 className="text-xl font-bold">Manual Verification</h3>
                       </div>
                       <form onSubmit={handleManualVerify} className="space-y-4">
                          <div className="relative">
                            <input 
                              type="text"
                              placeholder="Type Ticket ID (e.g. TC-12345)"
                              value={manualCode}
                              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                              className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-5 text-xl font-mono tracking-widest text-center focus:outline-none focus:border-rose-500 transition-colors"
                            />
                            <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600" />
                          </div>
                          <button 
                            type="submit"
                            disabled={!manualCode || isProcessing}
                            className="w-full bg-rose-600 disabled:opacity-50 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-rose-600/20 active:scale-95"
                          >
                            Verify Ticket
                          </button>
                       </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Status Overlay */}
              <AnimatePresence>
                {scanResult && (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className={cn(
                      "absolute inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md",
                      scanResult.type === "success" ? "bg-emerald-500/10" : "bg-rose-500/10"
                    )}
                  >
                    <div className="bg-[#0A0A0A] border border-white/10 p-10 rounded-[3rem] shadow-2xl flex flex-col items-center text-center space-y-6 max-w-sm w-full mx-auto ring-1 ring-white/10">
                      <div className={cn(
                        "w-24 h-24 rounded-full flex items-center justify-center mb-2 animate-bounce",
                        scanResult.type === "success" ? "bg-emerald-500/20 text-emerald-500" : (scanResult.type === "warning" ? "bg-amber-500/20 text-amber-500" : "bg-rose-500/20 text-rose-500")
                      )}>
                        {scanResult.type === "success" ? <ShieldCheck className="w-12 h-12" /> : <X className="w-12 h-12" />}
                      </div>
                      
                      <div className="space-y-2">
                        <h2 className={cn(
                          "text-4xl font-black tracking-tighter uppercase",
                          scanResult.type === "success" ? "text-emerald-500" : (scanResult.type === "warning" ? "text-amber-500" : "text-rose-500")
                        )}>
                          {scanResult.message}
                        </h2>
                        <p className="text-2xl font-bold">{scanResult.detail}</p>
                        {scanResult.extra && <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">{scanResult.extra}</p>}
                      </div>
                      
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: "100%" }} 
                          animate={{ width: "0%" }} 
                          transition={{ duration: 2.5, ease: "linear" }}
                          className={cn(
                            "h-full",
                            scanResult.type === "success" ? "bg-emerald-500" : (scanResult.type === "warning" ? "bg-amber-500" : "bg-rose-500")
                          )}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Controls */}
            {isScanning && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button 
                  onClick={handleSwitchCamera}
                  className="bg-[#0F0F0F] hover:bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all active:scale-95"
                >
                  <RotateCw className="w-5 h-5 text-rose-500" /> Switch
                </button>
                <button 
                  onClick={stopScanning}
                  className="bg-[#0F0F0F] hover:bg-rose-500/10 border border-white/5 p-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-rose-500 transition-all active:scale-95"
                >
                  <X className="w-5 h-5" /> Stop
                </button>
                <div className="bg-[#0F0F0F] border border-white/5 p-4 rounded-2xl items-center justify-center gap-3 font-mono text-gray-500 hidden md:flex">
                  <Maximize2 className="w-4 h-4" /> AUTO-FOCUS
                </div>
                <div className="bg-[#0F0F0F] border border-white/5 p-4 rounded-2xl items-center justify-center gap-3 font-mono text-gray-500 hidden md:flex">
                  <CheckSquare className="w-4 h-4" /> VERIFIED-ONLY
                </div>
              </div>
            )}
          </div>

          {/* History Sidebar */}
          <aside className="lg:col-span-4 flex flex-col h-full bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-xl min-h-[500px]">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-br from-rose-500/5 to-transparent">
              <div className="flex items-center gap-3">
                <History className="w-5 h-5 text-rose-500" />
                <h2 className="font-black uppercase tracking-widest text-sm">Recent Activity</h2>
              </div>
              <span className="bg-rose-500/10 text-rose-500 text-[10px] font-black px-3 py-1 rounded-full">{history.length}</span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
              <AnimatePresence initial={false}>
                {history.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-30 space-y-4 py-20">
                    <History className="w-12 h-12" />
                    <p className="text-xs font-bold uppercase tracking-widest">No history yet</p>
                  </div>
                ) : (
                  history.map((entry, i) => (
                    <motion.div 
                      key={entry.id + i}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="group bg-[#0F0F0F] border border-white/5 p-5 rounded-2xl flex items-center gap-5 hover:border-white/10 transition-all relative overflow-hidden"
                    >
                      <div className={cn(
                        "shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-black border",
                        entry.status === "success" ? "border-emerald-500/20 text-emerald-500" : "border-rose-500/20 text-rose-500"
                      )}>
                        {entry.status === "success" ? <User className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-sm truncate uppercase tracking-tight">{entry.name}</h4>
                          <span className="text-[10px] font-mono text-gray-600">{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-[10px] font-bold text-gray-500 truncate uppercase tracking-widest flex items-center gap-2">
                          {entry.status === "success" ? <span className="text-emerald-500/70">{entry.category || "Verified"}</span> : <span className="text-rose-500/70">{entry.detail}</span>}
                          <span className="text-gray-700">•</span>
                          {entry.id.split(':').pop().slice(0, 8)}...
                        </p>
                      </div>

                      {entry.status === "success" && (
                        <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500" />
                      )}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            <div className="p-6 bg-black/40 border-t border-white/5">
              <button 
                onClick={() => setHistory([])}
                className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
              >
                <Trash2 className="w-4 h-4" /> Clear History
              </button>
            </div>
          </aside>
        </main>
      </div>

      <style jsx global>{`
        @keyframes scan {
          0%, 100% { top: 0; opacity: 0.1; }
          50% { top: 100%; opacity: 1; }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}