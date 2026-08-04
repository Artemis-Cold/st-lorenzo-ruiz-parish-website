import { NavigationController } from "./components/NavigationController";

// Drop this into your router, e.g.:
//   <Route path="/navigate" element={<NavigationPage />} />
export default function NavigationPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#111" }}>
      <NavigationController />
    </div>
  );
}
