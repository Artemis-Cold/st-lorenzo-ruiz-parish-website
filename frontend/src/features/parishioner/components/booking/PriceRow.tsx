interface Props {
  label: string;
  price: number;
  checked?: boolean;
}

export default function PriceRow({ label, price, checked }: Props) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          defaultChecked={checked}
          className="h-5 w-5 accent-[#B22222]"
        />

        <span>{label}</span>
      </div>

      <span className="font-semibold">₱{price.toLocaleString()}</span>
    </div>
  );
}
