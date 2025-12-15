"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface LatestOrderData {
  id: string;
  orderCode: string;
  customerName: string;
  status: string;
  createdAt: string;
  totalPrice: number;
}

interface UseOrderNotificationOptions {
  enabled?: boolean;
  pollingInterval?: number;
  onNewOrder?: (order: LatestOrderData) => void;
}

const STORAGE_KEY = "enableOrderNotification";
const LAST_ORDER_KEY = "lastKnownOrderId";

export function useOrderNotification(options: UseOrderNotificationOptions = {}) {
  const { 
    enabled: initialEnabled = true, 
    pollingInterval = 6000,
    onNewOrder 
  } = options;

  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [newOrderId, setNewOrderId] = useState<string | null>(null);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const isPlayingRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastOrderIdRef = useRef<string | null>(null);
  const router = useRouter();

  // Load preferences from localStorage
  useEffect(() => {
    const storedEnabled = localStorage.getItem(STORAGE_KEY);
    if (storedEnabled !== null) {
      setIsEnabled(storedEnabled === "true");
    }
    
    // Load last known order ID
    const storedOrderId = localStorage.getItem(LAST_ORDER_KEY);
    if (storedOrderId) {
      lastOrderIdRef.current = storedOrderId;
    }
  }, []);

  // Save preference to localStorage
  const toggleNotification = useCallback((value: boolean) => {
    setIsEnabled(value);
    localStorage.setItem(STORAGE_KEY, String(value));
    
    // If turning on, play test sound to enable audio
    if (value && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, []);

  // Initialize audio on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/Notifikasi/notifikasi.mp3");
      audioRef.current.volume = 0.8;
      audioRef.current.preload = "auto";
      
      audioRef.current.addEventListener("canplaythrough", () => {
        setIsAudioReady(true);
      });
    }
  }, []);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/Notifikasi/notifikasi.mp3");
      audioRef.current.volume = 0.8;
    }
    
    if (isPlayingRef.current) return;
    
    isPlayingRef.current = true;
    audioRef.current.currentTime = 0;
    
    audioRef.current.play()
      .then(() => {
        setIsAudioReady(true);
        console.log("🔊 Audio playing!");
      })
      .catch((err) => {
        console.warn("Audio play failed:", err.message);
      })
      .finally(() => {
        setTimeout(() => {
          isPlayingRef.current = false;
        }, 1000);
      });
  }, []);

  // Show toast notification
  const showToast = useCallback((order: LatestOrderData) => {
    toast.success(`🔔 Pesanan Baru! ${order.customerName} - ${order.orderCode}`, {
      duration: 5000,
      style: {
        background: "#2A251F",
        border: "2px solid #D4A857",
        color: "#fff",
        fontSize: "14px",
        fontWeight: "600",
      },
    });
  }, []);

  // Polling for new orders
  useEffect(() => {
    if (!isEnabled) return;

    let mounted = true;

    const checkNewOrders = async () => {
      try {
        const res = await fetch("/api/admin/orders/latest");
        if (!res.ok) return;
        
        const data = await res.json();
        
        if (!mounted) return;
        
        const latestOrder = data.latestOrder as LatestOrderData | null;
        
        if (!latestOrder) return;
        
        const lastKnown = lastOrderIdRef.current;
        
        // Check if this is a NEW order we haven't seen before
        if (lastKnown && latestOrder.id !== lastKnown) {
          console.log("🆕 New order detected:", latestOrder.orderCode);
          
          setNewOrderId(latestOrder.id);
          
          // Play sound
          playNotificationSound();
          
          // Show toast
          showToast(latestOrder);
          
          // Callback
          onNewOrder?.(latestOrder);
          
          // Clear highlight after 3 seconds
          setTimeout(() => {
            setNewOrderId(null);
          }, 3000);
        }
        
        // Always update the last known order
        lastOrderIdRef.current = latestOrder.id;
        localStorage.setItem(LAST_ORDER_KEY, latestOrder.id);
        
      } catch (error) {
        // Silently fail
      }
    };

    // Initial check
    checkNewOrders();

    // Set up polling
    const interval = setInterval(checkNewOrders, pollingInterval);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [isEnabled, pollingInterval, playNotificationSound, showToast, onNewOrder]);

  return {
    isEnabled,
    toggleNotification,
    newOrderId,
    isAudioReady,
    playNotificationSound,
  };
}
