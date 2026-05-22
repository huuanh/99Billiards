"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import { CanvasTexture, SRGBColorSpace } from "three";
import type { Group, Texture } from "three";

type VectorTuple = [number, number, number];
type BallNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
type BilliardBall = {
  number: BallNumber;
  rack: VectorTuple;
  break: VectorTuple;
  color: string;
  striped: boolean;
};

const ballStyles: Record<BallNumber, { color: string; striped: boolean }> = {
  1: { color: "#f2c21a", striped: false },
  2: { color: "#1e58a8", striped: false },
  3: { color: "#c82226", striped: false },
  4: { color: "#5f2f8f", striped: false },
  5: { color: "#e97822", striped: false },
  6: { color: "#0b6f3a", striped: false },
  7: { color: "#7b2024", striped: false },
  8: { color: "#111111", striped: false },
  9: { color: "#f2c21a", striped: true },
  10: { color: "#1e58a8", striped: true },
};

const fixedBalls: Array<Pick<BilliardBall, "number" | "rack" | "break">> = [
  { number: 1, rack: [0, 1.24, 0.16], break: [-2.55, 1.55, 0.55] },
  { number: 10, rack: [0, -0.24, 0.2], break: [0.95, -1.45, 0.75] },
  { number: 2, rack: [-1.32, -0.98, 0.06], break: [-0.15, 2.18, -0.55] },
  { number: 3, rack: [1.32, -0.98, 0.04], break: [2.85, -0.55, -0.2] },
];

const randomRackSlots: Array<{ rack: VectorTuple; break: VectorTuple }> = [
  { rack: [-0.44, 0.5, 0.08], break: [-2.25, -0.45, 0.7] },
  { rack: [0.44, 0.5, 0.1], break: [2.45, 0.95, 0.4] },
  { rack: [-0.88, -0.24, 0.12], break: [-1.8, 0.68, -0.35] },
  { rack: [0.88, -0.24, 0.08], break: [1.35, 1.78, -0.35] },
  { rack: [-0.44, -0.98, 0.14], break: [-0.95, -1.78, 0.2] },
  { rack: [0.44, -0.98, 0.1], break: [2.08, -1.82, 0.35] },
];

function shuffleBallNumbers(numbers: BallNumber[]) {
  const result = [...numbers];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function withStyle(ball: Pick<BilliardBall, "number" | "rack" | "break">): BilliardBall {
  return {
    ...ball,
    ...ballStyles[ball.number],
  };
}

function makeRackBalls(): BilliardBall[] {
  const shuffled = shuffleBallNumbers([4, 5, 6, 7, 8, 9]);
  return [
    ...fixedBalls.map(withStyle),
    ...randomRackSlots.map((slot, index) =>
      withStyle({
        number: shuffled[index],
        rack: slot.rack,
        break: slot.break,
      }),
    ),
  ];
}

function makeBallTexture(number: number, color: string, striped: boolean): Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  if (!context) return new CanvasTexture(canvas);

  context.fillStyle = striped ? "#f8f5ea" : color;
  context.fillRect(0, 0, canvas.width, canvas.height);

  if (striped) {
    context.fillStyle = color;
    context.fillRect(0, 176, canvas.width, 160);
  }

  const labelX = canvas.width / 2;
  const labelY = canvas.height / 2;
  const labelRadius = 108;
  context.beginPath();
  context.arc(labelX, labelY, labelRadius, 0, Math.PI * 2);
  context.fillStyle = "#f8f5ea";
  context.fill();
  context.lineWidth = 10;
  context.strokeStyle = "rgba(16, 16, 16, 0.18)";
  context.stroke();

  context.fillStyle = "#111111";
  context.font = "900 116px Arial, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(String(number), labelX, labelY + 6);

  const shine = context.createRadialGradient(260, 110, 0, 260, 110, 260);
  shine.addColorStop(0, "rgba(255,255,255,0.55)");
  shine.addColorStop(0.22, "rgba(255,255,255,0.18)");
  shine.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = shine;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function BallActor({ ball, exploded }: { ball: BilliardBall; exploded: boolean }) {
  const groupRef = useRef<Group>(null);
  const texture = useMemo(
    () => makeBallTexture(ball.number, ball.color, ball.striped),
    [ball.color, ball.number, ball.striped],
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const target = exploded ? ball.break : ball.rack;
    groupRef.current.position.lerp({ x: target[0], y: target[1], z: target[2] }, exploded ? 0.07 : 0.09);
    groupRef.current.rotation.x += (exploded ? 0.045 : 0.01) + ball.number * 0.0008;
    groupRef.current.rotation.y += exploded ? 0.035 : 0.008;
    groupRef.current.position.y += Math.sin(clock.getElapsedTime() * 1.2 + ball.number) * 0.0015;
  });

  return (
    <group ref={groupRef} position={ball.rack}>
      <mesh rotation={[0, -Math.PI / 2, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.44, 72, 72]} />
        <meshPhysicalMaterial
          map={texture}
          roughness={0.2}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.04}
          ior={1.42}
        />
      </mesh>
    </group>
  );
}

function BallCluster({ exploded }: { exploded: boolean }) {
  const groupRef = useRef<Group>(null);
  const balls = useMemo(() => makeRackBalls(), []);

  useFrame(({ clock, pointer, size }) => {
    if (!groupRef.current) return;
    const elapsed = clock.getElapsedTime();
    groupRef.current.rotation.y = Math.sin(elapsed * 0.2) * 0.08 + pointer.x * 0.12;
    groupRef.current.rotation.x = -0.1 + pointer.y * 0.08;
    const targetX = size.width < 768 ? 0 : -0.46;
    groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.08;
    groupRef.current.position.y = 0.1 + Math.sin(elapsed * 0.45) * 0.08;
    const targetScale = exploded ? 0.78 : 0.82;
    groupRef.current.scale.lerp({ x: targetScale, y: targetScale, z: targetScale }, 0.06);
  });

  return (
    <group ref={groupRef} position={[0, 0.1, 0]} rotation={[0, -0.12, 0.02]} scale={0.9}>
      {balls.map((ball) => (
        <BallActor key={ball.number} ball={ball} exploded={exploded} />
      ))}
    </group>
  );
}

export function BilliardsHero3D() {
  const [exploded, setExploded] = useState(false);

  return (
    <div
      aria-hidden="true"
      data-testid="billiards-hero-3d"
      onPointerEnter={() => setExploded(true)}
      onPointerLeave={() => setExploded(false)}
      className="pointer-events-auto absolute inset-x-0 top-16 z-[1] h-[42vh] min-h-[300px] opacity-75 md:inset-y-0 md:left-auto md:right-0 md:h-auto md:w-[54%] md:min-h-0 md:opacity-90 xl:right-[2%] xl:w-[48%]"
    >
      <Canvas
        shadows
        dpr={[1, 1.65]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          preserveDrawingBuffer: true,
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 0.1, 7.9]} fov={42} />
        <ambientLight intensity={0.75} />
        <directionalLight position={[-4, 5, 5]} intensity={2.1} color="#fff8df" castShadow />
        <pointLight position={[2.8, -1.6, 2.6]} intensity={1.6} color="#d6ff3f" />
        <pointLight position={[-2.4, 2.4, 2.2]} intensity={1.2} color="#ffffff" />
        <BallCluster exploded={exploded} />
      </Canvas>
    </div>
  );
}
