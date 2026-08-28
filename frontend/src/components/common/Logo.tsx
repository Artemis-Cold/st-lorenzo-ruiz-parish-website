import ParishLogo from "./ParishLogo";

export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white p-1 shadow-sm ring-1 ring-[#E7E2DA]">
        <ParishLogo className="size-full" />
      </span>

      <div>
        <h1 className="font-serif text-lg font-bold text-[#292524]">
          St. Lorenzo Ruiz Parish
        </h1>

        <p className="text-xs text-gray-500">Dagatan, Taysan, Batangas</p>
      </div>
    </div>
  );
}
