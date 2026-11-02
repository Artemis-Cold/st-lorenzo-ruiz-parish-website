import DashboardLayout from "@/features/parishioner/components/DashboardLayout";
import SLRPAppContent from "../components/SLRPAppContent";

export default function SLRPAppPage() {
  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#B22222] sm:text-4xl">
            SLRP AR
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            Your parish navigation app.
          </p>
        </div>
        <SLRPAppContent />
      </div>
    </DashboardLayout>
  );
}
