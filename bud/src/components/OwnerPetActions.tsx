import { usePetStore, type Pet } from "../stores/petStore";
import { showError, showSuccess } from "../lib/api";
import { useAuthStore } from "../stores/authStore";
import { useStatusHistoryStore } from "../stores/statusHistoryStore";
import { useReunionStore } from "../stores/reunionStore";

const actionBtnProfile =
  "rounded-lg px-2.5 py-2 font-body text-[10px] font-bold uppercase tracking-wide transition-transform active:scale-[0.97]";

const actionBtnDetail =
  "w-full rounded-[1.12rem] py-3.5 font-body text-sm font-bold uppercase tracking-widest transition-transform active:scale-[0.98]";

type OwnerPetActionsProps = {
  pet: Pet;
  /** `profile` = compact row under list item; `detail` = full-width detail screen */
  variant: "profile" | "detail";
  onAfterRemove?: () => void;
};

export function OwnerPetActions({ pet, variant, onAfterRemove }: OwnerPetActionsProps) {
  const updatePetStatus = usePetStore((s) => s.updatePetStatus);
  const removePet = usePetStore((s) => s.removePet);
  const recordChange = useStatusHistoryStore((s) => s.recordChange);
  const startReunion = useReunionStore((s) => s.start);
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const btn = variant === "profile" ? actionBtnProfile : actionBtnDetail;

  function actorLabel() {
    return profile?.display_name?.trim() || user?.email || "Owner";
  }

  async function markFound() {
    const fromStatus = pet.status;
    const { error } = await updatePetStatus(pet.id, "FOUND");
    if (error) showError(error);
    else {
      if (user) {
        recordChange({
          petId: pet.id,
          from: fromStatus,
          to: "FOUND",
          byUserId: user.id,
          byUserName: actorLabel(),
        });
      }
      showSuccess(`${pet.name} marked as found.`);
    }
  }

  async function markReunited() {
    const fromStatus = pet.status;
    const { error } = await updatePetStatus(pet.id, "REUNITED");
    if (error) showError(error);
    else {
      if (user) {
        recordChange({
          petId: pet.id,
          from: fromStatus,
          to: "REUNITED",
          byUserId: user.id,
          byUserName: actorLabel(),
        });
      }
      startReunion(pet.id);
      showSuccess(`${pet.name} marked as reunited!`);
    }
  }

  async function removeFromPlatform() {
    if (
      !window.confirm(
        `Remove ${pet.name} from the platform? It will disappear from the community board. This cannot be undone.`
      )
    ) {
      return;
    }
    const { error } = await removePet(pet.id);
    if (error) {
      showError(error);
      return;
    }
    showSuccess("Report removed.");
    onAfterRemove?.();
  }

  if (variant === "profile") {
    return (
      <div className="flex flex-wrap gap-2 border-t border-white/30 bg-white/25 px-3 py-2.5">
        <p className="w-full font-body text-[10px] font-semibold uppercase tracking-wide text-bud-text-muted">
          Your report — you can update or remove it
        </p>
        {pet.status === "LOST" && (
          <button
            type="button"
            onClick={() => void markFound()}
            className={`${btn} border border-bud-primary/35 bg-white/60 text-bud-primary`}
          >
            Mark found
          </button>
        )}
        {(pet.status === "LOST" || pet.status === "FOUND") && (
          <button type="button" onClick={() => void markReunited()} className={`${btn} bg-green-600 text-white shadow-sm`}>
            Reunited
          </button>
        )}
        <button type="button" onClick={() => void removeFromPlatform()} className={`${btn} border border-red-200 bg-red-50/90 text-red-800`}>
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="font-body text-center text-[11px] font-semibold uppercase tracking-wide text-bud-text-muted">
        Your report — you can update or remove it
      </p>
      {pet.status === "LOST" && (
        <button
          type="button"
          onClick={() => void markFound()}
          className={`${btn} border-2 border-bud-primary/40 bg-white/40 text-bud-primary backdrop-blur-sm motion-safe:hover:brightness-[1.02]`}
        >
          Mark as found
        </button>
      )}
      {(pet.status === "LOST" || pet.status === "FOUND") && (
        <button type="button" onClick={() => void markReunited()} className={`${btn} bg-green-600 text-white shadow-ambient motion-safe:hover:brightness-[1.03]`}>
          Mark as reunited
        </button>
      )}
      <button
        type="button"
        onClick={() => void removeFromPlatform()}
        className={`${btn} border-2 border-red-200/90 bg-red-50/80 text-red-800 backdrop-blur-sm`}
      >
        Remove this report
      </button>
    </div>
  );
}
