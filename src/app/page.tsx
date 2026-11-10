'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { FlightStatus, getFlightData } from '@/lib/api';
import SearchBar from '@/components/SearchBar';
import FlightCard from '@/components/FlightCard';
import { Plane } from 'lucide-react';

import InteractiveBackground from '@/components/InteractiveBackground';

// Dynamically import the map component to avoid SSR issues with Leaflet/Globe
const FlightMap = dynamic(() => import('@/components/FlightMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] md:h-[500px] rounded-2xl bg-slate-800/50 animate-pulse flex items-center justify-center text-slate-600">
      Loading Flight Map...
    </div>
  ),
});

export default function Home() {
  const [flightData, setFlightData] = useState<FlightStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [lastSuccessfulUpdate, setLastSuccessfulUpdate] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const requestId = useRef(0);
  const activeController = useRef<AbortController | null>(null);
  const refreshInFlight = useRef(false);

  const handleSearch = useCallback(async (flightNumber: string) => {
    activeController.current?.abort();
    activeController.current = null;
    const thisRequest = ++requestId.current;
    const controller = new AbortController();
    activeController.current = controller;
    let timedOut = false;
    const timeout = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 20_000);

    setLoading(true);
    setError('');
    setRefreshError(null);
    setLastSuccessfulUpdate(null);
    setIsRefreshing(false);
    refreshInFlight.current = false;
    setFlightData(null);

    try {
      const data = await getFlightData(flightNumber, controller.signal);
      if (thisRequest !== requestId.current) return;

      if (data) {
        setFlightData(data);
        setSearchQuery(flightNumber);
        setLastSuccessfulUpdate(new Date());
      } else {
        setError('No flight data is available for that search. Check the flight number and try again.');
      }
    } catch (err) {
      if (thisRequest !== requestId.current) return;
      const errorMessage = timedOut
        ? 'The flight lookup took too long. Please try again.'
        : err instanceof Error
          ? err.message
          : 'The flight lookup failed. Please try again.';
      setError(errorMessage);
    } finally {
      window.clearTimeout(timeout);
      if (thisRequest === requestId.current) {
        activeController.current = null;
        setLoading(false);
      }
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    if (!flightData || !searchQuery || isRefreshing || refreshInFlight.current) return;

    activeController.current?.abort();
    activeController.current = null;
    const thisRequest = ++requestId.current;
    const controller = new AbortController();
    activeController.current = controller;
    let timedOut = false;
    const timeout = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 20_000);

    setIsRefreshing(true);
    refreshInFlight.current = true;

    try {
      const data = await getFlightData(searchQuery, controller.signal);
      if (thisRequest !== requestId.current) return;

      if (data) {
        setFlightData(data);
        setLastSuccessfulUpdate(new Date());
        setRefreshError(null);
      } else {
        setRefreshError('No new flight data was returned.');
      }
    } catch (err) {
      if (thisRequest !== requestId.current) return;
      setRefreshError(timedOut
        ? 'The update took too long.'
        : err instanceof Error
          ? err.message
          : 'The update failed.');
    } finally {
      window.clearTimeout(timeout);
      if (thisRequest === requestId.current) {
        activeController.current = null;
        refreshInFlight.current = false;
        setIsRefreshing(false);
      }
    }
  }, [flightData, isRefreshing, searchQuery]);

  useEffect(() => {
    if (!flightData || !searchQuery) return;

    const interval = window.setInterval(() => {
      void handleRefresh();
    }, 60_000);

    return () => window.clearInterval(interval);
  }, [flightData, handleRefresh, searchQuery]);

  useEffect(() => () => {
    activeController.current?.abort();
    activeController.current = null;
    requestId.current += 1;
  }, []);

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-100 p-4 md:p-8 relative overflow-hidden">
      <InteractiveBackground />
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none" />
      <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="flex flex-col items-center justify-center mb-12 pt-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
              <Plane className="text-white" size={32} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                Live Flight Tracker
              </h1>
              <a
                href="https://devxgroup.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-blue-400/60 uppercase tracking-[0.3em] font-bold hover:text-blue-400 transition-colors ml-1"
              >
                By DevX Group LLC
              </a>
            </div>
          </div>
          <p className="text-slate-400 text-lg max-w-2xl text-center">
            Flight position and available trip details on an interactive map.
          </p>
          <p className="text-slate-500 text-sm max-w-2xl text-center mt-2">
            Position and trip details depend on available flight data.
          </p>
        </header>

        <div className="mb-12 flex flex-col items-center gap-6">
          <div className="w-full max-w-2xl">
            <SearchBar onSearch={handleSearch} isLoading={loading} />
          </div>

          {error && (
            <div role="alert" className="text-center text-red-300 bg-red-900/20 py-2 px-4 rounded-lg border border-red-900/50 inline-block mx-auto w-full max-w-md animate-fade-in">
              {error}
            </div>
          )}
        </div>

        {flightData && (
          <div className="space-y-8 animate-fade-in">
            <FlightCard
              flight={flightData}
              lastSuccessfulUpdate={lastSuccessfulUpdate}
              refreshError={refreshError}
            />
            <FlightMap flight={flightData} onRefresh={handleRefresh} />
            {isRefreshing && <p role="status" className="text-center text-sm text-slate-400">Updating flight data...</p>}
          </div>
        )}

        {!flightData && !loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 opacity-70">
            <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50">
              <h3 className="font-bold text-xl mb-2 text-slate-200">Live position</h3>
              <p className="text-slate-400">See a flight position when a data source has it.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50">
              <h3 className="font-bold text-xl mb-2 text-slate-200">Trip details</h3>
              <p className="text-slate-400">Available schedule details appear with the flight.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50">
              <h3 className="font-bold text-xl mb-2 text-slate-200">Provider coverage</h3>
              <p className="text-slate-400">Coverage varies by flight and data source.</p>
            </div>
          </div>
        )}

        <footer className="mt-16 pb-8 text-center relative z-10">
          <div className="flex flex-col items-center gap-4">
            <a
              href="https://devxgroup.io"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-slate-400 hover:text-slate-200 transition-all duration-300 group cursor-pointer bg-slate-800/20 py-3 px-6 rounded-full border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800/40"
            >
              <img
                src="/devx-logo.png"
                alt="DevX Group LLC logo"
                className="h-8 w-auto object-contain brightness-90 group-hover:brightness-110 group-hover:scale-105 transition-all"
              />
              <div className="text-left">
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-semibold">Brought to you by</p>
                <p className="font-bold text-slate-300 group-hover:text-blue-400 transition-colors tracking-tight">DevX Group LLC</p>
                <p className="text-[10px] text-slate-500">Flight data sources are listed with each result</p>
              </div>
            </a>
            <div className="flex gap-6 mt-2">
              <a href="https://devxgroup.io" className="text-xs text-slate-500 hover:text-blue-400 transition-colors">Our Website</a>
              <a href="https://devxgroup.io/contact" className="text-xs text-slate-500 hover:text-blue-400 transition-colors">Contact Us</a>
              <a href="https://devxgroup.io/services" className="text-xs text-slate-500 hover:text-blue-400 transition-colors">Services</a>
            </div>
            <a href="/data-and-privacy" className="inline-flex min-h-[44px] items-center px-3 text-xs text-slate-400 underline underline-offset-4 hover:text-blue-300 transition-colors">Data and privacy</a>
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-slate-800 to-transparent my-2" />
            <p className="text-[10px] text-slate-600 uppercase tracking-widest">© {new Date().getFullYear()} DevX Group LLC. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </main>
  );
}
