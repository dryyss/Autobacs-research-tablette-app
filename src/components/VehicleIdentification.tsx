'use client';

import { useEffect, useRef, useState } from 'react';
import { identifyVehicle, type SivVehicle } from '@/lib/siv';
import { Car, CheckCircle2, AlertTriangle } from 'lucide-react';

interface Props {
  plate: string;
  onSuccess: (vehicle: SivVehicle) => void;
  onFailure: () => void;
  onCancel: () => void;
}

type Phase = 'checking' | 'found' | 'error';

// Afficher "Continuer sans attendre" après 3s
const SHOW_SKIP_AFTER = 3_000;
// Timeout dur après 5s (déclenche une erreur)
const HARD_TIMEOUT = 5_000;

export function VehicleIdentification({ plate, onSuccess, onFailure, onCancel }: Props) {
  const [phase, setPhase] = useState<Phase>('checking');
  const [vehicle, setVehicle] = useState<SivVehicle | null>(null);
  const [errorType, setErrorType] = useState<string>('');
  const [showSkip, setShowSkip] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const phaseRef = useRef<Phase>('checking');
  phaseRef.current = phase;

  useEffect(() => {
    let mounted = true;
    const startedAt = Date.now();

    const tickInterval = setInterval(() => {
      if (mounted) setElapsed(Date.now() - startedAt);
    }, 100);

    const skipTimer = setTimeout(() => {
      if (mounted) setShowSkip(true);
    }, SHOW_SKIP_AFTER);

    const hardTimer = setTimeout(() => {
      if (mounted && phaseRef.current === 'checking') {
        setErrorType('TIMEOUT');
        setPhase('error');
      }
    }, HARD_TIMEOUT);

    identifyVehicle(plate).then((result) => {
      if (!mounted || phaseRef.current !== 'checking') return;

      if (result.success && result.vehicle) {
        setVehicle(result.vehicle);
        setPhase('found');
        setTimeout(() => {
          if (mounted) onSuccess(result.vehicle!);
        }, 800);
      } else {
        setErrorType(result.error || 'UNKNOWN');
        setPhase('error');
      }
    });

    return () => {
      mounted = false;
      clearInterval(tickInterval);
      clearTimeout(skipTimer);
      clearTimeout(hardTimer);
    };
  }, [plate, onSuccess]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(15, 15, 15, 0.95)',
        backdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        className="bg-[var(--autobacs-card-bg)] border border-[var(--autobacs-border)] shadow-2xl max-w-md w-full"
        style={{ animation: 'scaleIn 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--autobacs-border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car size={18} className="text-[var(--autobacs-orange)]" />
            <h2
              className="text-sm uppercase tracking-wider text-[var(--autobacs-text-muted)]"
              style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
            >
              Identification véhicule
            </h2>
          </div>
          <div className="text-sm font-mono text-[var(--autobacs-black)] tracking-widest">{plate}</div>
        </div>

        {/* Body */}
        <div className="p-8 flex flex-col items-center gap-4 min-h-[260px] justify-center">
          {phase === 'checking' && (
            <>
              <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
                {/* Cercle de fond */}
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(217,120,45,.1)' }} />
                {/* Ring principal */}
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  border: '2px solid transparent',
                  borderTopColor: '#D9782D', borderRightColor: 'rgba(217,120,45,.3)',
                  animation: 'ringSpin 1.1s linear infinite',
                }} />
                {/* Ring secondaire inverse */}
                <div style={{
                  position: 'absolute', inset: 12, borderRadius: '50%',
                  border: '1px solid transparent',
                  borderTopColor: 'rgba(217,120,45,.35)',
                  animation: 'ringSpin 1.8s linear infinite reverse',
                }} />
                {/* Logo dans bulle sombre */}
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: '#1a1a1a', border: '1px solid rgba(255,255,255,.07)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
                }}>
                  <img src="/autobacs-logo.svg" alt="Autobacs" style={{ width: 48, height: 34, objectFit: 'contain' }} />
                </div>
              </div>

              <div className="text-center">
                <p
                  className="text-base tracking-wider"
                  style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
                >
                  INTERROGATION DU FICHIER SIV
                </p>
                <p className="text-xs text-[var(--autobacs-text-muted)] mt-1">
                  Identification de votre véhicule… {(elapsed / 1000).toFixed(1)}s
                </p>
              </div>

              {/* Bouton "Continuer sans attendre" après 3s */}
              {showSkip && (
                <div className="w-full mt-2" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                  <p className="text-xs text-[var(--autobacs-text-muted)] text-center mb-2">
                    Le service SIV met du temps à répondre
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={onCancel}
                      className="flex-1 px-4 py-2.5 border border-[var(--autobacs-border)] hover:border-[var(--autobacs-text-muted)] transition-all uppercase tracking-wide text-xs"
                      style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
                    >
                      Annuler
                    </button>
                    <button
                      onClick={onFailure}
                      className="flex-1 px-4 py-2.5 bg-[var(--autobacs-orange)] hover:bg-[var(--autobacs-orange-dark)] transition-all uppercase tracking-wide text-xs"
                      style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
                    >
                      Continuer sans plaque
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {phase === 'found' && vehicle && (
            <>
              <div style={{ animation: 'scaleIn 0.4s ease-out' }}>
                <CheckCircle2 size={72} className="text-[var(--status-green)]" strokeWidth={2} />
              </div>
              <div className="text-center">
                <p
                  className="text-[10px] text-[var(--autobacs-orange)] uppercase tracking-wider font-bold mb-1"
                  style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                >
                  Véhicule identifié
                </p>
                <h3
                  className="text-2xl mb-1"
                  style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900 }}
                >
                  {vehicle.brand} {vehicle.model}
                </h3>
                <p className="text-sm text-[var(--autobacs-text-muted)] mb-2">
                  {vehicle.version}
                </p>
                <div className="flex gap-3 justify-center text-xs">
                  <span className="px-2 py-1 bg-[var(--autobacs-dark-bg)] border border-[var(--autobacs-border)]">
                    {vehicle.year}
                  </span>
                  <span className="px-2 py-1 bg-[var(--autobacs-dark-bg)] border border-[var(--autobacs-border)]">
                    {vehicle.fuelType}
                  </span>
                  <span className="px-2 py-1 bg-[var(--autobacs-dark-bg)] border border-[var(--autobacs-border)]">
                    {vehicle.power}
                  </span>
                </div>
              </div>
            </>
          )}

          {phase === 'error' && (
            <>
              <AlertTriangle size={64} className="text-[var(--status-amber)]" />
              <div className="text-center">
                <p
                  className="text-lg mb-1"
                  style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
                >
                  {errorType === 'INVALID_FORMAT'
                    ? 'FORMAT DE PLAQUE INVALIDE'
                    : errorType === 'TIMEOUT'
                    ? 'SERVICE TEMPORAIREMENT INDISPONIBLE'
                    : 'VÉHICULE NON TROUVÉ'}
                </p>
                <p className="text-xs text-[var(--autobacs-text-muted)] mb-4">
                  {errorType === 'INVALID_FORMAT'
                    ? 'Vérifiez le format (ex: AB-123-CD)'
                    : 'Vous pouvez poursuivre par catégorie'}
                </p>
              </div>
              <div className="flex gap-2 w-full">
                <button
                  onClick={onCancel}
                  className="flex-1 px-4 py-3 border border-[var(--autobacs-border)] hover:border-[var(--autobacs-text-muted)] transition-all uppercase tracking-wide text-xs"
                  style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
                >
                  Retour
                </button>
                <button
                  onClick={onFailure}
                  className="flex-1 px-4 py-3 bg-[var(--autobacs-orange)] hover:bg-[var(--autobacs-orange-dark)] transition-all uppercase tracking-wide text-xs"
                  style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
                >
                  Continuer sans plaque
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes ringSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spinReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes logoPulse {
          0%, 100% { transform: scale(0.85); opacity: 0.4; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes logoFloat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes radar {
          0%   { transform: scale(0.4); opacity: 0.9; }
          100% { transform: scale(1.0); opacity: 0; }
        }
        @keyframes scanLine {
          0%   { transform: translateY(-50px); opacity: 0; }
          50%  { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(50px); opacity: 0; }
        }
        @keyframes signalBar {
          from { height: 4px; opacity: 0.4; }
          to   { height: 20px; opacity: 1; }
        }
        @keyframes bounce {
          from { transform: translateY(0); opacity: 0.4; }
          to { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
