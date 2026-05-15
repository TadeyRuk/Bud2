import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useAuthStore } from "../../stores/authStore";
import { useNotificationStore } from "../../stores/notificationStore";
import { usePetStore } from "../../stores/petStore";
import {
  useSightingStore,
  type SightingMood,
} from "../../stores/sightingStore";
import { useUiStore } from "../../stores/uiStore";
import { getOnboardingProfile } from "../../lib/onboardingProfile";
import { supabase, supabaseConfigured } from "../../lib/supabase";
import { showError, showSuccess } from "../../lib/api";
import { DEMO_REPORTER_ID } from "../../data/pets";
import { StepDetails } from "./StepDetails";
import { StepLocation, type WhenChoice } from "./StepLocation";
import { StepPhoto } from "./StepPhoto";
import type { PetStatus } from "../../types/database";

function statusPillClass(status: PetStatus): string {
  switch (status) {
    case "LOST":
      return "bg-red-600 text-white";
    case "FOUND":
      return "bg-green-600 text-white";
    case "REUNITED":
      return "bg-blue-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
}

function whenLabel(w: WhenChoice): string {
  switch (w) {
    case "just-now":
      return "Just now";
    case "within-hour":
      return "Within an hour";
    case "earlier-today":
      return "Earlier today";
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(typeof r.result === "string" ? r.result : "");
    r.onerror = () => reject(new Error("read"));
    r.readAsDataURL(file);
  });
}

const PET_IMAGE_PLACEHOLDER =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="#E2DDD5"/></svg>`
  );

export function SightingSheet() {
  const open = useUiStore((s) => s.sightingSheetOpen);
  const sheetPetId = useUiStore((s) => s.sightingSheetPetId);
  const originRect = useUiStore((s) => s.sightingSheetOriginRect);
  const focusReturnEl = useUiStore((s) => s.sightingSheetFocusEl);
  const closeSightingSheet = useUiStore((s) => s.closeSightingSheet);
  const setSightingPulsePetId = useUiStore((s) => s.setSightingPulsePetId);

  const pets = usePetStore((s) => s.pets);
  const pet = sheetPetId ? pets.find((p) => p.id === sheetPetId) : undefined;

  const [displayPet, setDisplayPet] = useState(pet);

  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const addSighting = useSightingStore((s) => s.addSighting);
  const addLocalNotification = useNotificationStore((s) => s.addLocalNotification);

  const sheetRef = useRef<HTMLDivElement>(null);
  const mapInteractionRef = useRef(false);
  const originSnapshotRef = useRef<{ left: number; top: number; width: number; height: number } | null>(
    null
  );
  const handlePointerDownY = useRef(0);
  const handleDragging = useRef(false);
  const previewUrlRef = useRef<string | null>(null);

  const [step, setStep] = useState(1);
  const [pinLat, setPinLat] = useState<number | null>(null);
  const [pinLng, setPinLng] = useState<number | null>(null);
  const [when, setWhen] = useState<WhenChoice>("just-now");
  const [locationLabel, setLocationLabel] = useState("");
  const [confidence, setConfidence] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [moods, setMoods] = useState<SightingMood[]>([]);
  const [message, setMessage] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitPhase, setSubmitPhase] = useState<"idle" | "loading" | "done">("idle");
  const [showExitBubbles, setShowExitBubbles] = useState(false);
  const prevOpenRef = useRef(open);
  const [leaving, setLeaving] = useState(false);

  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const revokePreview = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }, []);

  const resetForm = useCallback(() => {
    setStep(1);
    setPinLat(null);
    setPinLng(null);
    setWhen("just-now");
    setLocationLabel("");
    setConfidence(0);
    setMoods([]);
    setMessage("");
    setPhotoFile(null);
    revokePreview();
    setPhotoPreview(null);
    setSubmitPhase("idle");
    setShowExitBubbles(false);
  }, [revokePreview]);

  useEffect(() => {
    if (pet) setDisplayPet(pet);
  }, [pet]);

  useLayoutEffect(() => {
    if (open && originRect) {
      originSnapshotRef.current = {
        left: originRect.left,
        top: originRect.top,
        width: originRect.width,
        height: originRect.height,
      };
    }
  }, [open, originRect]);

  useEffect(() => {
    if (open) {
      setLeaving(false);
      prevOpenRef.current = true;
      return;
    }
    if (prevOpenRef.current) {
      prevOpenRef.current = false;
      setLeaving(true);
      const t = window.setTimeout(() => setLeaving(false), reduceMotion ? 120 : 360);
      return () => window.clearTimeout(t);
    }
  }, [open, reduceMotion]);

  useEffect(() => {
    if (!open || !pet) return;
    resetForm();
    if (pet.lat != null && pet.lng != null) {
      setPinLat(pet.lat);
      setPinLng(pet.lng);
    }
  }, [open, pet?.id, pet?.lat, pet?.lng, pet, resetForm]);

  useEffect(() => {
    if (!open) return;
    const root = sheetRef.current;
    if (!root) return;
    const focusables = root.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const list = [...focusables].filter((el) => !el.hasAttribute("disabled"));
    const first = list[0];
    const last = list[list.length - 1];
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || list.length === 0) return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          last?.focus();
          e.preventDefault();
        }
      } else if (document.activeElement === last) {
        first?.focus();
        e.preventDefault();
      }
    };
    root.addEventListener("keydown", onKey);
    return () => root.removeEventListener("keydown", onKey);
  }, [open, step]);

  const handleClose = useCallback(() => {
    resetForm();
    closeSightingSheet();
    window.requestAnimationFrame(() => {
      focusReturnEl?.focus?.();
    });
  }, [closeSightingSheet, focusReturnEl, resetForm]);

  const onPhotoFile = useCallback(
    (file: File | null) => {
      setPhotoFile(file);
      revokePreview();
      if (file) {
        const url = URL.createObjectURL(file);
        previewUrlRef.current = url;
        setPhotoPreview(url);
      } else {
        setPhotoPreview(null);
      }
    },
    [revokePreview]
  );

  const toggleMood = useCallback((m: SightingMood) => {
    setMoods((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  }, []);

  const canNextFromStep = (s: number): boolean => {
    if (s === 1) return pinLat != null && pinLng != null;
    if (s === 2) return confidence >= 1;
    return true;
  };

  const runSubmit = useCallback(async () => {
    if (!displayPet) return;

    setSubmitPhase("loading");
    if (!reduceMotion) setShowExitBubbles(true);

    const reporterId = user?.id ?? DEMO_REPORTER_ID;
    const reporterName =
      profile?.display_name?.trim() ||
      user?.email ||
      getOnboardingProfile()?.name?.trim() ||
      "Neighbor";

    const area =
      locationLabel.trim() ||
      (pinLat != null && pinLng != null
        ? `${pinLat.toFixed(5)}, ${pinLng.toFixed(5)}`
        : "");

    let photoDataUrl: string | null = null;
    if (photoFile) {
      try {
        photoDataUrl = await fileToDataUrl(photoFile);
      } catch {
        photoDataUrl = null;
      }
    }

    const metaLine = [
      moods.length ? `Mood: ${moods.map((m) => m.replace(/-/g, " ")).join(", ")}` : "",
      `When: ${whenLabel(when)}`,
    ]
      .filter(Boolean)
      .join(" · ");

    const trimmedMsg = message.trim();
    let displayMessage = trimmedMsg;
    if (!displayMessage && metaLine) displayMessage = metaLine;
    if (!displayMessage) displayMessage = "Reported, no details shared.";

    const dbMessage =
      [trimmedMsg, metaLine].filter(Boolean).join("\n").slice(0, 2000) || displayMessage;

    addSighting({
      petId: displayPet.id,
      reporterId,
      reporterName,
      message: displayMessage,
      moods,
      confidence: (confidence >= 1 ? confidence : 1) as 1 | 2 | 3 | 4 | 5,
      when,
      lat: pinLat,
      lng: pinLng,
      locationLabel: area,
      photoDataUrl,
    });

    if (supabaseConfigured && user) {
      const { error } = await supabase.from("sightings").insert({
        pet_id: displayPet.id,
        reporter_id: user.id,
        message: dbMessage,
        location_text: area,
        lat: pinLat,
        lng: pinLng,
        photo_url: null,
      });

      if (error) {
        setSubmitPhase("idle");
        setShowExitBubbles(false);
        showError(error);
        return;
      }

      if (
        displayPet.reporter_id &&
        displayPet.reporter_id !== DEMO_REPORTER_ID &&
        displayPet.reporter_id !== user.id
      ) {
        await supabase.from("notifications").insert({
          user_id: displayPet.reporter_id,
          type: "sighting" as const,
          title: `New sighting for ${displayPet.name}`,
          body: dbMessage.slice(0, 200),
          pet_id: displayPet.id,
          read: false,
        });
      }
    }

    if (user) {
      addLocalNotification({
        user_id: user.id,
        type: "sighting",
        title: "Sighting recorded",
        body: `Your tip for ${displayPet.name} is live on the timeline.`,
        pet_id: displayPet.id,
        read: false,
      });
    }

    setSightingPulsePetId(displayPet.id);
    window.setTimeout(() => setSightingPulsePetId(null), 4000);

    const snap = originSnapshotRef.current;
    if (snap && !reduceMotion) {
      const cx = snap.left + snap.width / 2;
      const cy = snap.top + snap.height / 2;
      const el = document.createElement("div");
      el.setAttribute("aria-hidden", "true");
      el.className =
        "pointer-events-none fixed z-[100] rounded-full bud-sighting-ripple bg-bud-primary/35 motion-reduce:hidden";
      el.style.width = "160px";
      el.style.height = "160px";
      el.style.left = `${cx - 80}px`;
      el.style.top = `${cy - 80}px`;
      document.body.appendChild(el);
      window.setTimeout(() => el.remove(), 760);
    }

    setSubmitPhase("done");
    showSuccess(`Thanks — your info about ${displayPet.name} was shared with the community.`);

    window.setTimeout(
      () => {
        setShowExitBubbles(false);
        handleClose();
      },
      reduceMotion ? 80 : 520
    );
  }, [
    addLocalNotification,
    addSighting,
    confidence,
    displayPet,
    handleClose,
    locationLabel,
    message,
    moods,
    photoFile,
    pinLat,
    pinLat,
    pinLng,
    profile?.display_name,
    reduceMotion,
    setSightingPulsePetId,
    user,
    when,
  ]);

  if (!displayPet) return null;
  if (!open && !leaving) return null;

  const avatarSrc = displayPet.image_url || PET_IMAGE_PLACEHOLDER;

  return (
    <div
      className="absolute inset-0 z-[65] flex flex-col justify-end"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close sighting form"
        className="absolute inset-0 bg-black/35 backdrop-blur-[2px] motion-safe:animate-[fadeIn_0.18s_ease-out_both] motion-reduce:opacity-100"
        onClick={handleClose}
        style={{
          animation: reduceMotion ? undefined : "fadeIn 0.18s ease-out both",
        }}
      />

      {showExitBubbles && !reduceMotion ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-24 z-[66] flex justify-center" aria-hidden>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className="absolute bottom-0 h-3 w-3 rounded-full bud-sighting-bubble-rise opacity-90"
              style={{
                left: `calc(50% + ${(i - 2.5) * 18}px)`,
                transform: "translateX(-50%)",
                backgroundColor:
                  i % 3 === 0 ? "rgba(139, 58, 21, 0.55)" : i % 3 === 1 ? "rgba(0, 87, 99, 0.5)" : "rgba(234, 179, 8, 0.6)",
                animationDelay: `${i * 90}ms`,
              }}
            />
          ))}
        </div>
      ) : null}

      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sighting-sheet-title"
        className={`relative z-[67] flex max-h-[min(92dvh,760px)] w-full max-w-[430px] flex-col self-center rounded-t-3xl border border-black/5 bg-bud-card/95 shadow-[0_-8px_40px_rgba(44,26,14,0.18)] backdrop-blur-xl motion-safe:transition-transform motion-safe:duration-300 motion-reduce:translate-y-0 ${
          open ? "translate-y-0 motion-safe:[transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]" : "translate-y-full"
        }`}
        style={{ marginLeft: "auto", marginRight: "auto" }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 overflow-hidden rounded-t-3xl opacity-90">
          <div className="bud-sighting-shimmer-edge h-full w-full" />
        </div>

        <div
          className="flex shrink-0 cursor-grab justify-center py-3 active:cursor-grabbing"
          onPointerDown={(e) => {
            if (mapInteractionRef.current) return;
            handleDragging.current = true;
            handlePointerDownY.current = e.clientY;
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!handleDragging.current || mapInteractionRef.current) return;
            const dy = e.clientY - handlePointerDownY.current;
            if (dy > 72) {
              handleDragging.current = false;
              handleClose();
            }
          }}
          onPointerUp={() => {
            handleDragging.current = false;
          }}
          onPointerCancel={() => {
            handleDragging.current = false;
          }}
        >
          <span className="h-1 w-9 rounded-full bg-bud-text-muted/35" />
        </div>

        <div className="shrink-0 border-b border-black/5 px-4 pb-3">
          <div className="flex items-center gap-3">
            <img
              src={avatarSrc}
              alt=""
              className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-black/10"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 id="sighting-sheet-title" className="truncate font-headline text-base font-bold text-bud-text">
                  {displayPet.name}
                </h2>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-wide ${statusPillClass(
                    displayPet.status
                  )}`}
                >
                  {displayPet.status}
                </span>
              </div>
                <p className="font-body text-xs text-bud-text-muted">
                  {user ? "Share a sighting for this pet" : "Share a sighting (saved on this device)"}
                </p>
            </div>
            <div className="flex shrink-0 gap-1.5">
              {[1, 2, 3].map((s) => (
                <span
                  key={s}
                  className={`h-2 w-2 rounded-full transition-transform ${
                    step === s
                      ? "scale-125 bg-bud-primary motion-safe:bud-sighting-pop-in motion-reduce:scale-125"
                      : "bg-bud-text-muted/25"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-2">
          <div className="relative min-h-[200px]">
            <div
              className={`transition-[opacity,transform] duration-200 motion-reduce:transition-none ${
                step === 1 ? "opacity-100 translate-x-0" : "pointer-events-none absolute inset-0 opacity-0 -translate-x-4"
              }`}
            >
              {step === 1 ? (
                <StepLocation
                  pet={displayPet}
                  pinLat={pinLat}
                  pinLng={pinLng}
                  onPick={(lat, lng) => {
                    setPinLat(lat);
                    setPinLng(lng);
                  }}
                  when={when}
                  onWhen={setWhen}
                  locationLabel={locationLabel}
                  onLocationLabel={setLocationLabel}
                  sheetOpen={open}
                  mapInteractionRef={mapInteractionRef}
                />
              ) : null}
            </div>
            <div
              className={`transition-[opacity,transform] duration-200 motion-reduce:transition-none ${
                step === 2 ? "opacity-100 translate-x-0" : "pointer-events-none absolute inset-0 opacity-0 translate-x-4"
              }`}
            >
              {step === 2 ? (
                <StepDetails
                  confidence={confidence}
                  onConfidence={(n) => setConfidence(n)}
                  moods={moods}
                  onToggleMood={toggleMood}
                  message={message}
                  onMessage={setMessage}
                />
              ) : null}
            </div>
            <div
              className={`transition-[opacity,transform] duration-200 motion-reduce:transition-none ${
                step === 3
                  ? "opacity-100 translate-x-0"
                  : "pointer-events-none absolute inset-0 opacity-0 translate-x-4"
              }`}
            >
              {step === 3 ? <StepPhoto preview={photoPreview} onFile={onPhotoFile} /> : null}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 z-[1] shrink-0 border-t border-black/5 bg-bud-card/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md">
          <div className="flex gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="shrink-0 rounded-xl border border-bud-text-muted/25 bg-white/55 px-4 py-3.5 font-body text-sm font-semibold text-bud-text"
              >
                Back
              </button>
            ) : null}
            {step < 3 ? (
              <button
                type="button"
                disabled={!canNextFromStep(step)}
                onClick={() => canNextFromStep(step) && setStep((s) => s + 1)}
                className={`rounded-xl bg-bud-primary py-3.5 font-body text-sm font-bold uppercase tracking-widest text-white shadow-ambient disabled:opacity-45 ${step > 1 ? "min-w-0 flex-1" : "w-full"}`}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                disabled={submitPhase !== "idle"}
                onClick={() => void runSubmit()}
                className={`flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-bud-primary py-3.5 font-body text-sm font-bold uppercase tracking-widest text-white shadow-ambient disabled:opacity-60 ${step > 1 ? "" : "w-full"}`}
              >
                {submitPhase === "loading" ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : submitPhase === "done" ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  "Submit sighting"
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
