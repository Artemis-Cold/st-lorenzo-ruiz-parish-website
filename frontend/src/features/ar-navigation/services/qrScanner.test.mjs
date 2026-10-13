import test from "node:test";
import assert from "node:assert/strict";
import { navigationSupported, scanQR } from "./qrScanner.ts";

test("unsupported, insecure, non-Android and rejected XR probes fail closed", async () => {
  const oldNavigator = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  const oldSecure = Object.getOwnPropertyDescriptor(
    globalThis,
    "isSecureContext",
  );
  const oldDetector = Object.getOwnPropertyDescriptor(
    globalThis,
    "BarcodeDetector",
  );
  try {
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: {
        userAgent: "Android",
        xr: { isSessionSupported: async () => true },
      },
    });
    globalThis.isSecureContext = true;
    globalThis.BarcodeDetector = class {
      static async getSupportedFormats() {
        return ["qr_code"];
      }
    };
    assert.equal(await navigationSupported(), true);
    globalThis.isSecureContext = false;
    assert.equal(await navigationSupported(), false);
    globalThis.isSecureContext = true;
    navigator.userAgent = "iPhone";
    assert.equal(await navigationSupported(), false);
    navigator.userAgent = "Android";
    navigator.xr.isSessionSupported = async () => {
      throw new Error("denied");
    };
    assert.equal(await navigationSupported(), false);
    delete globalThis.BarcodeDetector;
    assert.equal(await navigationSupported(), false);
  } finally {
    for (const [key, descriptor] of [
      ["navigator", oldNavigator],
      ["isSecureContext", oldSecure],
      ["BarcodeDetector", oldDetector],
    ]) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});

test("leaving scanner while camera permission is pending releases the late stream", async () => {
  const oldNavigator = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  let resolve,
    stopped = 0;
  const permission = new Promise((r) => {
    resolve = r;
  });
  globalThis.BarcodeDetector = class {};
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { mediaDevices: { getUserMedia: () => permission } },
  });
  try {
    const video = { srcObject: null };
    const dispose = scanQR(
      video,
      () => {
        throw new Error("must not scan");
      },
      () => {
        throw new Error("must not update after dispose");
      },
    );
    dispose();
    resolve({ getTracks: () => [{ stop: () => stopped++ }] });
    await permission;
    await Promise.resolve();
    assert.equal(stopped, 1);
    assert.equal(video.srcObject, null);
  } finally {
    Object.defineProperty(globalThis, "navigator", oldNavigator);
    delete globalThis.BarcodeDetector;
  }
});
