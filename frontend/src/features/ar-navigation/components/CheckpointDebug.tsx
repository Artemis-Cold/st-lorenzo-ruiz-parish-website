import type { useNavigation } from "../hooks/useNavigation";
import type { BuildingConfig } from "../types/checkpointNavigation";

export default function CheckpointDebug({
  navigation,
  cameraMode,
  building,
}: {
  navigation: ReturnType<typeof useNavigation>;
  cameraMode: boolean;
  building: BuildingConfig;
}) {
  const { state, instruction, report, reportTarget } = navigation;
  const visible = building.checkpoints.find(
    (item) => item.id === state.visibleCheckpointId,
  );
  return (
    <div className="nav-debug">
      <dl>
        <dt>Detected target</dt>
        <dd>{visible?.targetIndex ?? "None / simulated point"}</dd>
        <dt>Current checkpoint</dt>
        <dd>{state.currentCheckpointId ?? "None"}</dd>
        <dt>Destination</dt>
        <dd>{state.destinationId}</dd>
        <dt>Tracking</dt>
        <dd>
          {visible
            ? cameraMode
              ? "MINDAR TARGET FOUND"
              : "SIMULATED TARGET FOUND"
            : state.currentCheckpointId
              ? "TARGET LOST — location retained"
              : "WAITING FOR CHECKPOINT"}
        </dd>
        <dt>Instruction</dt>
        <dd>{instruction?.direction ?? "None"}</dd>
        <dt>Route</dt>
        <dd>{state.route?.nodes.join(" → ") ?? "Not localized"}</dd>
      </dl>
      {!cameraMode && (import.meta.env.DEV || building.schematic) && (
        <>
          <h3>Simulate a checkpoint</h3>
          <p>
            {building.schematic
              ? "Preview only: choose a location manually. No camera location is being detected."
              : "Choose an entrance or hallway marker."}
          </p>
          <div className="nav-destinations">
            {building.checkpoints
              .filter((item) => building.schematic || item.targetIndex !== null)
              .map((item) => (
                <button
                  key={item.id}
                  className="nav-place"
                  onClick={() =>
                    item.targetIndex === null
                      ? report({ type: "found", id: item.id })
                      : reportTarget(item.targetIndex, true)
                  }
                >
                  <span>
                    {item.name}
                    <small>
                      {item.targetIndex === null
                        ? "Simulation only"
                        : `Target ${item.targetIndex}`}
                    </small>
                  </span>
                </button>
              ))}
          </div>
          <button
            className="nav-secondary"
            disabled={!visible}
            onClick={() =>
              visible &&
              (visible.targetIndex === null
                ? report({ type: "lost", id: visible.id })
                : reportTarget(visible.targetIndex, false))
            }
          >
            Simulate target lost
          </button>
        </>
      )}
    </div>
  );
}
