import type {
  NavigationMap,
  NavigationSnapshot,
  RouteGeometry,
} from "../types/navigation";

interface MiniMapProps {
  map: NavigationMap;
  route: RouteGeometry;
  snapshot: NavigationSnapshot;
  compact?: boolean;
}

const WIDTH = 220;
const HEIGHT = 210;
const PADDING = 14;
const MINIMUM_X = -7;
const MAXIMUM_X = 7;
const MINIMUM_Z = -7;
const MAXIMUM_Z = 12;

export default function MiniMap({
  map,
  route,
  snapshot,
  compact = false,
}: MiniMapProps) {
  const scale = Math.min(
    (WIDTH - PADDING * 2) / (MAXIMUM_X - MINIMUM_X),
    (HEIGHT - PADDING * 2) / (MAXIMUM_Z - MINIMUM_Z),
  );
  const offsetX = (WIDTH - (MAXIMUM_X - MINIMUM_X) * scale) / 2;
  const point = (x: number, z: number) => ({
    x: offsetX + (x - MINIMUM_X) * scale,
    y: PADDING + (z - MINIMUM_Z) * scale,
  });
  const rectangle = (
    minimumX: number,
    minimumZ: number,
    maximumX: number,
    maximumZ: number,
  ) => {
    const start = point(minimumX, minimumZ);
    return {
      x: start.x,
      y: start.y,
      width: (maximumX - minimumX) * scale,
      height: (maximumZ - minimumZ) * scale,
    };
  };
  const mainHouse = rectangle(-7, -7, 7, 7);
  const terrace = rectangle(-3.5, 7, 3.5, 12);
  const livingRoom = rectangle(-2.5, -2, 2.5, 6);
  const routePoints = route.nodes
    .map((node) => {
      const projected = point(node.x, node.z);
      return `${projected.x},${projected.y}`;
    })
    .join(" ");
  const pose = point(snapshot.pose.x, snapshot.pose.z);
  const destination = route.nodes.at(-1)!;
  const destinationPoint = point(destination.x, destination.z);

  return (
    <div
      className={`overflow-hidden border border-white/25 bg-stone-950/70 shadow-xl backdrop-blur-md ${
        compact ? "rounded-2xl p-1.5" : "rounded-3xl p-3"
      }`}
    >
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        aria-label="House route mini-map"
        className="h-auto w-full"
      >
        <rect
          {...mainHouse}
          rx="4"
          fill="rgba(255,255,255,0.06)"
          stroke="rgba(255,255,255,0.38)"
          strokeWidth="1.5"
        />
        <rect
          {...terrace}
          fill="rgba(255,255,255,0.04)"
          stroke="rgba(255,255,255,0.32)"
          strokeWidth="1.5"
        />
        <rect
          {...livingRoom}
          rx="3"
          fill="rgba(0,0,0,0.34)"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="1.25"
        />

        {map.edges.map((edge) => {
          const from = map.nodes.find((node) => node.id === edge.from)!;
          const to = map.nodes.find((node) => node.id === edge.to)!;
          const start = point(from.x, from.z);
          const end = point(to.x, to.z);

          return (
            <line
              key={`${edge.from}-${edge.to}`}
              x1={start.x}
              y1={start.y}
              x2={end.x}
              y2={end.y}
              stroke="rgba(255,255,255,0.16)"
              strokeWidth="3"
              strokeLinecap="round"
            />
          );
        })}

        <polyline
          points={routePoints}
          fill="none"
          stroke="#22d3ee"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx={destinationPoint.x}
          cy={destinationPoint.y}
          r="5"
          fill="#fbbf24"
          stroke="#ffffff"
          strokeWidth="2"
        />
        <circle
          cx={pose.x}
          cy={pose.y}
          r="5"
          fill="#ffffff"
          stroke="#0891b2"
          strokeWidth="3"
        />
      </svg>
    </div>
  );
}
