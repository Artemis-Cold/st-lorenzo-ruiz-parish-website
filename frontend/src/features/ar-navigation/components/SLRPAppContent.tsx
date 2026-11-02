import { useState } from "react";
import { Download, MapPin, ScanLine, Smartphone } from "lucide-react";
import parishLogo from "@/assets/images/pdf-logo.png";
import { slrpApkUrl } from "../unityApp";

export default function SLRPAppContent() {
  const isAndroid = /Android/i.test(navigator.userAgent);
  const [confirmed, setConfirmed] = useState(false);
  return (
    <div className="text-stone-800">
      <section className="grid overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm lg:grid-cols-2">
        <div className="bg-linear-to-br from-[#B22222] to-[#671313] p-7 text-white sm:p-12">
          <img
            src={parishLogo}
            alt="St. Lorenzo Ruiz Parish"
            className="mb-8 size-20 rounded-full bg-white p-1"
          />
          <p className="text-sm font-semibold tracking-widest text-[#F5D76E]">
            YOUR PARISH GUIDE
          </p>
          <h2 className="mt-4 font-serif text-3xl font-bold sm:text-4xl">
            Find your way around the parish
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-red-50">
            Find your way around St. Lorenzo Ruiz Parish with our Android
            navigation app.
          </p>
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2 text-sm">
            <Smartphone size={18} /> Android · ARCore-supported devices
          </div>
          <p className="mt-6 text-sm text-red-100">
            Download the app, scan a parish QR marker, and choose where you want
            to go.
          </p>
        </div>
        <div className="p-7 sm:p-12">
          <h2 className="font-serif text-2xl font-bold">Get the app</h2>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">
            Download SLRP AR for your Android phone.
          </p>
          <div className="mt-6 rounded-2xl bg-stone-50 p-5 text-sm leading-relaxed">
            <p className="font-semibold">Before you download</p>
            <p className="mt-2">
              You need an ARCore-supported Android phone with Google Play
              Services for AR installed and updated.
            </p>
            <a
              href="https://developers.google.com/ar/devices"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block font-semibold text-[#B22222] underline underline-offset-4"
            >
              Check supported devices
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.google.ar.core"
              target="_blank"
              rel="noreferrer"
              className="mt-2 block font-semibold text-[#B22222] underline underline-offset-4"
            >
              Google Play Services for AR
            </a>
          </div>
          {isAndroid ? (
            <>
              <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(event) => setConfirmed(event.target.checked)}
                  className="mt-1 size-4 shrink-0 accent-[#B22222]"
                />
                I checked that my phone supports ARCore.
              </label>
              {confirmed ? (
                <a
                  href={slrpApkUrl}
                  download="SLRP-AR.apk"
                  className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#B22222] px-5 py-3 font-semibold text-white hover:bg-[#981B1B]"
                >
                  <Download size={19} /> Download SLRP AR
                </a>
              ) : (
                <button
                  disabled
                  className="mt-5 min-h-12 w-full rounded-xl bg-stone-200 px-5 py-3 font-semibold text-stone-500"
                >
                  Download SLRP AR
                </button>
              )}
              <p className="mt-3 text-xs leading-relaxed text-stone-500">
                Android APK · about 42 MB. Your browser cannot verify ARCore
                compatibility.
              </p>
            </>
          ) : (
            <div
              role="status"
              className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950"
            >
              Open this page on a supported Android phone to download SLRP AR.
              The app is not available for iPhone, iPad, or desktop.
            </div>
          )}
        </div>
      </section>
      <section className="mt-12" aria-labelledby="start-heading">
        <h2 id="start-heading" className="font-serif text-3xl font-bold">
          Start navigating
        </h2>
        <ol className="mt-6 grid gap-5 md:grid-cols-3">
          {[
            {
              title: "Install SLRP AR",
              icon: Smartphone,
              text: "Open the downloaded APK on your Android phone and follow the installation prompts. If asked, allow installation from your browser, then turn that permission off after installing.",
            },
            {
              title: "Scan a parish marker",
              icon: ScanLine,
              text: "Open SLRP AR and allow camera access. Scan a QR marker at the parish using the app.",
            },
            {
              title: "Choose your destination",
              icon: MapPin,
              text: "Select your destination and follow the app’s guidance. Stay aware of steps and people around you.",
            },
          ].map(({ title, icon: Icon, text }, index) => (
            <li
              key={title}
              className="rounded-2xl border border-stone-200 bg-white p-6"
            >
              <Icon className="text-[#B22222]" size={25} />
              <h3 className="mt-4 text-lg font-bold">
                {index + 1}. {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                {text}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
