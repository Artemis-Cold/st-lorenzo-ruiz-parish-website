import type {
  NavigationMap,
  NavigationSnapshot,
  RouteGeometry,
} from "../types/navigation";

interface MiniMapProps {
  map: NavigationMap;
  route: RouteGeometry;
  snapshot: NavigationSnapshot;
}

const WIDTH = 190;
const HEIGHT = 132;
const PADDING = 15;

export default function MiniMap({ map, route, snapshot }: MiniMapProps) {
  const minimumX = Math.min(...map.nodes.map((node) => node.x));
  const maximumX = Math.max(...map.nodes.map((node) => node.x));
  const minimumZ = Math.min(...map.nodes.map((node) => node.z));
  const maximumZ = Math.max(...map.nodes.map((node) => node.z));
  const scale = Math.min(
    (WIDTH - PADDING * 2) / Math.max(1, maximumX - minimumX),
    (HEIGHT - PADDING * 2) / Math.max(1, maximumZ - minimumZ),
  );
  const point = (x: number, z: number) => ({
    x: PADDING + (x - minimumX) * scale,
    y: HEIGHT - PADDING - (z - minimumZ) * scale,
  });
  const routePoints = route.nodes
    .map((node) => {
      const projected = point(node.x, node.z);
      return `${projected.x},${projected.y}`;
    })
    .join(" ");
  const pose = point(snapshot.pose.x, snapshot.pose.z);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/30 bg-black/55 p-2 shadow-xl backdrop-blur-md">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        aria-label="Current indoor route mini-map"
        className="h-auto w-full"
      >
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
              stroke="rgba(255,255,255,0.28)"
              strokeWidth="5"
              strokeLinecap="round"
            />
          );
        })}
        <polyline
          points={routePoints}
          fill="none"
          stroke="#22f4ee"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
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
