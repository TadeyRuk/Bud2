import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { GEOLOCATION_OPTIONS, isGeolocationSupported } from "../hooks/useGeolocation";
import type { GeoPosition } from "../hooks/useGeolocation";
import { usePetStore } from "../stores/petStore";
import { showError, showSuccess } from "../lib/api";
import { getOnboardingProfile } from "../lib/onboardingProfile";
import type { PetType } from "../types/database";

type GpsCaptureStatus = "idle" | "loading" | "captured" | "denied";

const TOTAL_STEPS = 4;

const inputWell =
  "w-full rounded-xl border border-white/40 bg-white/85 px-3 py-3 font-body text-sm text-bud-text outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] ring-bud-primary/15 placeholder:text-bud-text-muted/70 focus:ring-2";

function ChoiceRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="font-body text-xs font-semibold uppercase tracking-wide text-bud-text">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2.5">{children}</div>
    </div>
  );
}

function ChoiceChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`relative min-h-[44px] rounded-[1rem] border px-4 py-2.5 font-body text-sm font-semibold outline-none transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-bud-primary/40 motion-safe:active:scale-[0.97] ${
        selected
          ? "z-[1] border-bud-primary bg-bud-primary text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.38),0_14px_32px_rgba(139,58,21,0.48)] ring-2 ring-white/85 ring-offset-[3px] ring-offset-white/40 motion-safe:scale-[1.045]"
          : "border-bud-text-muted/22 bg-white/72 text-bud-text shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] motion-safe:hover:scale-[1.025] hover:border-bud-primary/50 hover:bg-white hover:shadow-[0_10px_26px_rgba(139,58,21,0.18)]"
      }`}
    >
      <span className="flex items-center justify-center gap-2">
        {selected ? (
          <svg className="h-4 w-4 shrink-0 text-white/95" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M20 6L9 17l-5-5"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
        {children}
      </span>
    </button>
  );
}

export function ReportLostPet() {
  const onboardingSnapshot = useMemo(() => getOnboardingProfile(), []);

  const [step, setStep] = useState(1);
  const [petType, setPetType] = useState<PetType>("dog");
  const [otherSpecies, setOtherSpecies] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [traits, setTraits] = useState("");
  const [color, setColor] = useState("");
  const [gender, setGender] = useState("Unknown");
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reportCoords, setReportCoords] = useState<GeoPosition | null>(null);
  const [gpsStatus, setGpsStatus] = useState<GpsCaptureStatus>("idle");
  const fileRef = useRef<HTMLInputElement>(null);
  const selectedFile = useRef<File | null>(null);

  const addPet = usePetStore((s) => s.addPet);

  useEffect(() => {
    const o = getOnboardingProfile();
    if (!o) return;
    const combined = [o.barangay, o.city].filter(Boolean).join(", ");
    setLocation((prev) => (prev.trim() ? prev : combined));
  }, []);

  useEffect(() => {
    if (petType !== "other") setOtherSpecies("");
  }, [petType]);

  function captureGps() {
    if (!isGeolocationSupported()) {
      setGpsStatus("denied");
      showError("Location is not available in this browser.");
      return;
    }
    setGpsStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setReportCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsStatus("captured");
      },
      () => {
        setReportCoords(null);
        setGpsStatus("denied");
        showError("Could not access your location. You can still submit with text only.");
      },
      GEOLOCATION_OPTIONS
    );
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPreview(null);
      selectedFile.current = null;
      return;
    }
    selectedFile.current = file;
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
  }

  function canAdvanceFrom(current: number): boolean {
    if (current === 1) {
      const nameOk = name.trim().length > 0;
      const otherOk = petType !== "other" || otherSpecies.trim().length > 0;
      return nameOk && otherOk;
    }
    if (current === 2) return true;
    if (current === 3) return location.trim().length > 0;
    return true;
  }

  async function submitReport() {
    if (!name.trim()) {
      showError("Please enter the pet's name");
      return;
    }
    if (petType === "other" && !otherSpecies.trim()) {
      showError("Please describe the type of pet");
      return;
    }
    if (!location.trim()) {
      showError("Please enter the last seen location");
      return;
    }

    setSubmitting(true);

    const result = await addPet(
      {
        name: name.trim(),
        breed: petType === "other" ? otherSpecies.trim() : null,
        color: color.trim() || "Unknown",
        fur_color: color.trim() || "Unknown",
        gender,
        status: "LOST",
        type: petType,
        location_text: location.trim(),
        lat: reportCoords?.lat ?? null,
        lng: reportCoords?.lng ?? null,
        image_url: null,
        description: traits.trim(),
      },
      selectedFile.current ?? undefined
    );

    setSubmitting(false);

    if (result.error) {
      showError(result.error);
    } else {
      showSuccess("Report submitted! Your pet appears on the community board.");
      setStep(1);
      setName("");
      setLocation("");
      setReportCoords(null);
      setGpsStatus("idle");
      setTraits("");
      setColor("");
      setGender("Unknown");
      setPetType("dog");
      setOtherSpecies("");
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      selectedFile.current = null;
      const o = getOnboardingProfile();
      if (o) {
        const combined = [o.barangay, o.city].filter(Boolean).join(", ");
        setLocation(combined);
      }
    }
  }

  const typeLabel =
    petType === "dog" ? "Dog" : petType === "cat" ? "Cat" : `Other · ${otherSpecies.trim() || "—"}`;

  return (
    <div className="min-h-0 space-y-8 overflow-y-auto px-5 pb-28 pt-6 transition-opacity duration-200">
      <header className="border-l-[6px] border-bud-primary pl-3">
        <h1 className="font-headline text-4xl font-black leading-tight tracking-tight text-bud-text">
          Bring Them
          <br />
          <span className="text-bud-primary">Home.</span>
        </h1>
        <p className="mt-3 max-w-[300px] font-body text-sm text-bud-text-muted">
          Provide details about the pet you&apos;ve lost. The more accurate the information, the better our community
          can help.
        </p>
        {onboardingSnapshot?.name ? (
          <p className="mt-2 max-w-[320px] font-body text-xs text-bud-accent">
            From your Bud setup: <span className="font-semibold text-bud-text">{onboardingSnapshot.name}</span>
            {onboardingSnapshot.barangay ? (
              <>
                {" "}
                · {onboardingSnapshot.barangay}
                {onboardingSnapshot.city ? `, ${onboardingSnapshot.city}` : ""}
              </>
            ) : null}
            . You can edit anything below.
          </p>
        ) : null}
      </header>

      <div className="flex items-center justify-center gap-2" aria-hidden>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <span
            key={i}
            className={`h-2 rounded-full transition-all duration-200 ${
              step === i + 1 ? "w-8 bg-bud-primary" : "w-2 bg-bud-text-muted/25"
            }`}
          />
        ))}
      </div>
      <p className="text-center font-body text-xs font-semibold uppercase tracking-widest text-bud-text-muted">
        Step {step} of {TOTAL_STEPS}
      </p>

      <div className="space-y-6">
        {step === 1 && (
          <section className="flex flex-col gap-4 space-y-4 rounded-[1.75rem] border border-white/45 bg-white/40 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-xl">
            <ChoiceRow label="Pet type">
              {(["dog", "cat", "other"] as const).map((t) => (
                <ChoiceChip key={t} selected={petType === t} onClick={() => setPetType(t)}>
                  {t === "dog" ? "Dog" : t === "cat" ? "Cat" : "Other"}
                </ChoiceChip>
              ))}
            </ChoiceRow>

            {petType === "other" ? (
              <div>
                <label htmlFor="pet-other-type" className="font-body text-xs font-semibold uppercase tracking-wide text-bud-text">
                  Describe
                </label>
                <input
                  id="pet-other-type"
                  value={otherSpecies}
                  onChange={(e) => setOtherSpecies(e.target.value)}
                  placeholder="Describe (e.g. rabbit, parrot, guinea pig)"
                  className={`${inputWell} mt-2`}
                />
              </div>
            ) : null}

            <div>
              <label htmlFor="pet-name" className="font-body text-xs font-semibold uppercase tracking-wide text-bud-text">
                Pet name
              </label>
              <input
                id="pet-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Barnaby"
                className={`${inputWell} mt-2`}
              />
            </div>

            <div>
              <label htmlFor="pet-color" className="font-body text-xs font-semibold uppercase tracking-wide text-bud-text">
                Color / collar
              </label>
              <input
                id="pet-color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Golden, Red Collar"
                className={`${inputWell} mt-2`}
              />
            </div>

            <ChoiceRow label="Gender">
              {(["Unknown", "Male", "Female"] as const).map((g) => (
                <ChoiceChip key={g} selected={gender === g} onClick={() => setGender(g)}>
                  {g}
                </ChoiceChip>
              ))}
            </ChoiceRow>
          </section>
        )}

        {step === 2 && (
          <section className="flex flex-col gap-4 rounded-[1.75rem] border border-white/45 bg-white/40 p-5 backdrop-blur-xl">
            <div>
              <p className="font-body text-sm font-semibold text-bud-text">Photo</p>
              <p className="mt-1 font-body text-xs text-bud-text-muted">
                A clear face shot helps neighbors recognize them quickly.
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              aria-pressed={Boolean(preview)}
              className={`flex aspect-[4/3] max-h-44 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed bg-white/80 transition-all duration-200 ease-out motion-safe:active:scale-[0.99] ${
                preview
                  ? "border-bud-primary/55 shadow-[0_12px_36px_rgba(139,58,21,0.22)] ring-2 ring-bud-primary/30 ring-offset-2 ring-offset-white/50 motion-safe:scale-[1.01]"
                  : "border-bud-text-muted/22 hover:border-bud-primary/35 hover:shadow-[0_8px_24px_rgba(139,58,21,0.1)]"
              }`}
            >
              {preview ? (
                <img src={preview} alt="Pet preview" className="h-full w-full object-cover" />
              ) : (
                <span className="font-body text-sm text-bud-text-muted">Tap to upload a photo</span>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={onFileChange}
              aria-label="Upload pet photo"
            />
          </section>
        )}

        {step === 3 && (
          <section className="flex flex-col gap-4 rounded-[1.75rem] border border-white/45 bg-white/40 p-5 backdrop-blur-xl">
            <div>
              <label htmlFor="last-seen" className="font-body text-xs font-semibold uppercase tracking-wide text-bud-text">
                Last seen location
              </label>
              <input
                id="last-seen"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Street, landmark, or barangay"
                className={`${inputWell} mt-2`}
              />
              <p className="font-body mt-2 text-xs leading-relaxed text-bud-text-muted">
                Your exact address and GPS point are not shown publicly — only an approximate area on the map.
              </p>
              <button
                type="button"
                onClick={captureGps}
                disabled={gpsStatus === "loading"}
                className="mt-3 w-full rounded-xl border-2 border-bud-accent/35 bg-white/80 py-3 font-body text-sm font-bold text-bud-accent transition-transform active:scale-[0.99] disabled:opacity-50"
              >
                {gpsStatus === "loading"
                  ? "Getting location…"
                  : gpsStatus === "captured"
                    ? "Location captured — tap to refresh"
                    : "Use my location (optional)"}
              </button>
              {gpsStatus === "captured" && (
                <p className="font-body mt-2 text-xs font-semibold text-bud-accent">
                  GPS saved for approximate map placement.
                </p>
              )}
              {gpsStatus === "denied" && (
                <p className="font-body mt-2 text-xs text-bud-text-muted">
                  GPS not set — you can still submit with the text location above.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="traits" className="font-body text-xs font-semibold uppercase tracking-wide text-bud-text">
                Description / traits
              </label>
              <textarea
                id="traits"
                value={traits}
                onChange={(e) => setTraits(e.target.value)}
                rows={4}
                placeholder="Collar color, markings, behavior, anything that helps identify them..."
                className={`${inputWell} mt-2 resize-none`}
              />
            </div>
          </section>
        )}

        {step === 4 && (
          <section className="space-y-3 rounded-[1.75rem] border border-white/50 bg-bud-card p-5 font-body text-sm text-bud-text shadow-ambient">
            <p className="font-headline text-base font-bold text-bud-text">Review</p>
            <p>
              <span className="text-bud-text-muted">Name:</span> {name || "—"}
            </p>
            <p>
              <span className="text-bud-text-muted">Type:</span> {typeLabel}
            </p>
            <p>
              <span className="text-bud-text-muted">Color:</span> {color || "—"}
            </p>
            <p>
              <span className="text-bud-text-muted">Gender:</span> {gender}
            </p>
            <p>
              <span className="text-bud-text-muted">Last seen (private notes):</span> {location || "—"}
            </p>
            <p>
              <span className="text-bud-text-muted">GPS for map:</span>{" "}
              {gpsStatus === "captured" ? "Captured (approximate on map)" : "Not set"}
            </p>
            <p>
              <span className="text-bud-text-muted">Photo:</span> {preview ? "Attached" : "None"}
            </p>
            {traits.trim() ? (
              <p>
                <span className="text-bud-text-muted">Notes:</span> {traits}
              </p>
            ) : null}
          </section>
        )}

        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                className="flex-1 rounded-xl border-2 border-bud-text-muted/20 py-3.5 font-body text-sm font-bold text-bud-text"
              >
                Back
              </button>
            ) : (
              <span className="flex-1" />
            )}
            {step < TOTAL_STEPS ? (
              <button
                type="button"
                disabled={!canAdvanceFrom(step)}
                onClick={() => setStep((s) => Math.min(TOTAL_STEPS, s + 1))}
                className="flex-1 rounded-xl bg-bud-primary py-3.5 font-body text-sm font-bold uppercase tracking-widest text-white shadow-ambient disabled:opacity-45"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={() => void submitReport()}
                className="flex-1 rounded-xl bg-bud-primary py-3.5 font-body text-sm font-bold uppercase tracking-widest text-white shadow-ambient transition-transform active:scale-[0.99] disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Submit Report"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
