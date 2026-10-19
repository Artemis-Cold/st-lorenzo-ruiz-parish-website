import { useEffect, useState } from "react";
import { getServicePackages } from "@/services/servicePackageService";
import { getServiceFees } from "@/services/serviceFeeService";
import { formatPhpCurrency } from "@/utils/currency";

export default function PreparationCost({
  code,
  sponsors,
}: {
  code: "baptism" | "confirmation";
  sponsors: number;
}) {
  const [amount, setAmount] = useState<number | null>(null);
  useEffect(() => {
    let active = true;
    const extra = code === "baptism" ? Math.max(sponsors - 2, 0) : 0;
    Promise.all([
      getServicePackages(code),
      extra ? getServiceFees(code) : Promise.resolve([]),
    ])
      .then(([packages, fees]) => {
        const selected = [...packages].sort(
          (a, b) =>
            Number(b.recommended) - Number(a.recommended) || a.id - b.id,
        )[0];
        const fee = fees.find((item) => item.code === "additional_sponsor");
        if (!selected || (extra && !fee))
          throw new Error("Pricing unavailable");
        if (active)
          setAmount(
            Number(selected.base_price) +
              selected.inclusions.reduce(
                (sum, item) => sum + Number(item.price),
                0,
              ) +
              extra * Number(fee?.amount ?? 0),
          );
      })
      .catch(() => {
        if (active) setAmount(null);
      });
    return () => {
      active = false;
    };
  }, [code, sponsors]);
  return (
    <p className="my-3 text-sm font-semibold text-[#B22222]">
      Additional fee / Karagdagang bayad:{" "}
      {amount === null
        ? "Price unavailable / Hindi makuha ang halaga"
        : formatPhpCurrency(amount)}{" "}
      <span className="block text-xs font-normal">
        Separate from wedding fees / Hiwalay sa bayad sa kasal
      </span>
    </p>
  );
}
