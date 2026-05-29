import Link from "next/link";
import { FontAwesomeIcon } from "@99billiards/ui";

/**
 * Back link used at the top of the cart + checkout flow.
 * No logo / nav — keeps the purchase steps distraction-free.
 */
export function PurchaseFlowHeader({
  backHref,
  backLabel,
}: {
  backHref: string;
  backLabel: string;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-[120px] md:px-6 md:pt-[128px]">
      <Link
        href={backHref}
        className="focus-ring inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#2EB958] hover:text-[#27a04b]"
      >
        <FontAwesomeIcon icon="arrow-left" className="h-3.5 w-3.5" />
        {backLabel}
      </Link>
    </div>
  );
}
