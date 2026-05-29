"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { useMemo, useRef } from "react";
import { CanvasTexture, SRGBColorSpace, Vector3 } from "three";
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

type PhaseName = "aim" | "windup" | "strike" | "travel" | "broken" | "reset" | "pause";

interface PhaseInfo {
  phase: PhaseName;
  phaseT: number;
  broken: boolean;
}

const PHASES: Array<{ name: PhaseName; duration: number }> = [
  { name: "aim", duration: 2.4 },
  { name: "windup", duration: 0.7 },
  { name: "strike", duration: 0.12 },
  { name: "travel", duration: 0.2 },
  { name: "broken", duration: 2.6 },
  { name: "reset", duration: 0.9 },
  { name: "pause", duration: 0.5 },
];
const LOOP_DURATION = PHASES.reduce((sum, p) => sum + p.duration, 0);

const CLUSTER_BASE_Y = -0.45;
const CUE_BALL_REST: VectorTuple = [0, 2.45, 0];
const CUE_BALL_IMPACT: VectorTuple = [0, 1.7, 0.05];
const CUE_BALL_DEFLECT: VectorTuple = [-0.9, 2.05, 0.35];
const CUE_TIP_OFFSET_AIM = 0.5;
const CUE_TIP_OFFSET_WINDUP = 1.4;
const CUE_TIP_OFFSET_STRIKE = 0.02;
const CUE_LENGTH = 3.6;

function computePhase(time: number): PhaseInfo {
  const t = time % LOOP_DURATION;
  let acc = 0;
  for (const segment of PHASES) {
    if (t < acc + segment.duration) {
      return {
        phase: segment.name,
        phaseT: (t - acc) / segment.duration,
        broken: segment.name === "broken" || segment.name === "reset",
      };
    }
    acc += segment.duration;
  }
  return { phase: "aim", phaseT: 0, broken: false };
}

function easeOutCubic(x: number) {
  return 1 - Math.pow(1 - x, 3);
}

function easeInQuart(x: number) {
  return x * x * x * x;
}

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

function makeCueBallTexture(): Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  if (!context) return new CanvasTexture(canvas);

  context.fillStyle = "#f7f1de";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "#c8202a";
  context.beginPath();
  context.arc(canvas.width / 2, canvas.height / 2, 22, 0, Math.PI * 2);
  context.fill();

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

function CueBall() {
  const groupRef = useRef<Group>(null);
  const texture = useMemo(() => makeCueBallTexture(), []);
  const positionRef = useRef(new Vector3(...CUE_BALL_REST));

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const { phase, phaseT } = computePhase(clock.getElapsedTime());

    const targetPosition = positionRef.current;

    if (phase === "aim" || phase === "windup" || phase === "strike" || phase === "pause") {
      targetPosition.set(...CUE_BALL_REST);
    } else if (phase === "travel") {
      const t = easeInQuart(phaseT);
      targetPosition.set(
        CUE_BALL_REST[0] + (CUE_BALL_IMPACT[0] - CUE_BALL_REST[0]) * t,
        CUE_BALL_REST[1] + (CUE_BALL_IMPACT[1] - CUE_BALL_REST[1]) * t,
        CUE_BALL_REST[2] + (CUE_BALL_IMPACT[2] - CUE_BALL_REST[2]) * t,
      );
    } else if (phase === "broken") {
      const t = easeOutCubic(Math.min(phaseT * 1.2, 1));
      targetPosition.set(
        CUE_BALL_IMPACT[0] + (CUE_BALL_DEFLECT[0] - CUE_BALL_IMPACT[0]) * t,
        CUE_BALL_IMPACT[1] + (CUE_BALL_DEFLECT[1] - CUE_BALL_IMPACT[1]) * t,
        CUE_BALL_IMPACT[2] + (CUE_BALL_DEFLECT[2] - CUE_BALL_IMPACT[2]) * t,
      );
    } else if (phase === "reset") {
      const t = easeOutCubic(phaseT);
      targetPosition.set(
        CUE_BALL_DEFLECT[0] + (CUE_BALL_REST[0] - CUE_BALL_DEFLECT[0]) * t,
        CUE_BALL_DEFLECT[1] + (CUE_BALL_REST[1] - CUE_BALL_DEFLECT[1]) * t,
        CUE_BALL_DEFLECT[2] + (CUE_BALL_REST[2] - CUE_BALL_DEFLECT[2]) * t,
      );
    }

    groupRef.current.position.lerp(targetPosition, 0.35);
    if (phase === "travel" || phase === "broken") {
      groupRef.current.rotation.x += 0.18;
      groupRef.current.rotation.y += 0.06;
    } else {
      groupRef.current.rotation.x += 0.01;
    }
  });

  return (
    <group ref={groupRef} position={CUE_BALL_REST}>
      <mesh rotation={[0, -Math.PI / 2, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.44, 72, 72]} />
        <meshPhysicalMaterial
          map={texture}
          roughness={0.18}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.04}
          ior={1.42}
        />
      </mesh>
    </group>
  );
}

function CueStick() {
  const groupRef = useRef<Group>(null);

  const tipLen = 0.05;
  const ferruleLen = 0.08;
  const shaftLen = CUE_LENGTH * 0.6;
  const wrapLen = 0.4;
  const buttLen = CUE_LENGTH - tipLen - ferruleLen - shaftLen - wrapLen;

  const tipCenterY = tipLen / 2;
  const ferruleCenterY = tipLen + ferruleLen / 2;
  const shaftBottom = tipLen + ferruleLen;
  const shaftCenterY = shaftBottom + shaftLen / 2;
  const wrapCenterY = shaftBottom + shaftLen + wrapLen / 2;
  const buttCenterY = shaftBottom + shaftLen + wrapLen + buttLen / 2;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const time = clock.getElapsedTime();
    const { phase, phaseT } = computePhase(time);

    let tipOffset = CUE_TIP_OFFSET_AIM;
    let visible = true;

    if (phase === "aim") {
      tipOffset = CUE_TIP_OFFSET_AIM + Math.sin(time * 3.5) * 0.04;
    } else if (phase === "windup") {
      const t = easeOutCubic(phaseT);
      tipOffset = CUE_TIP_OFFSET_AIM + (CUE_TIP_OFFSET_WINDUP - CUE_TIP_OFFSET_AIM) * t;
    } else if (phase === "strike") {
      const t = easeInQuart(phaseT);
      tipOffset = CUE_TIP_OFFSET_WINDUP + (CUE_TIP_OFFSET_STRIKE - CUE_TIP_OFFSET_WINDUP) * t;
    } else if (phase === "travel") {
      tipOffset = CUE_TIP_OFFSET_STRIKE - phaseT * 0.4;
    } else if (phase === "broken") {
      tipOffset = CUE_TIP_OFFSET_AIM + phaseT * 1.6;
      visible = phaseT < 0.55;
    } else if (phase === "reset") {
      tipOffset = CUE_TIP_OFFSET_AIM + (1 - easeOutCubic(phaseT)) * 1.0;
    } else {
      tipOffset = CUE_TIP_OFFSET_AIM;
    }

    const tipY = CUE_BALL_REST[1] + tipOffset;
    groupRef.current.position.set(CUE_BALL_REST[0], tipY, CUE_BALL_REST[2]);
    groupRef.current.visible = visible;
  });

  return (
    <group ref={groupRef}>
      {/* tip (blue chalk) at local y=0 */}
      <mesh position={[0, tipCenterY, 0]} castShadow>
        <cylinderGeometry args={[0.038, 0.04, tipLen, 18]} />
        <meshStandardMaterial color="#1e58a8" roughness={0.85} />
      </mesh>
      {/* ferrule (white band) */}
      <mesh position={[0, ferruleCenterY, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, ferruleLen, 18]} />
        <meshStandardMaterial color="#f8f5ea" roughness={0.4} />
      </mesh>
      {/* shaft (light maple) */}
      <mesh position={[0, shaftCenterY, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.065, shaftLen, 24]} />
        <meshStandardMaterial color="#e9d8a4" roughness={0.55} metalness={0.05} />
      </mesh>
      {/* wrap (grip) */}
      <mesh position={[0, wrapCenterY, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, wrapLen, 24]} />
        <meshStandardMaterial color="#1c1410" roughness={0.95} />
      </mesh>
      {/* butt (dark wood) */}
      <mesh position={[0, buttCenterY, 0]} castShadow>
        <cylinderGeometry args={[0.065, 0.085, buttLen, 24]} />
        <meshStandardMaterial color="#382214" roughness={0.65} metalness={0.1} />
      </mesh>
    </group>
  );
}

function BallCluster() {
  const groupRef = useRef<Group>(null);
  const balls = useMemo(() => makeRackBalls(), []);

  useFrame(({ clock, pointer, size }) => {
    if (!groupRef.current) return;
    const elapsed = clock.getElapsedTime();
    const { broken } = computePhase(elapsed);
    const isMobile = size.width < 768;

    groupRef.current.rotation.y = Math.sin(elapsed * 0.2) * 0.08 + pointer.x * 0.12;
    groupRef.current.rotation.x = -0.1 + pointer.y * 0.08;
    // Mobile: xoay cả cluster -90° quanh trục Z để cú bắn diễn ra ngang
    // (cue ball + cue stick ở bên phải, cụm bi ở bên trái), thay vì dọc.
    const targetRotZ = isMobile ? -Math.PI / 2 : 0;
    groupRef.current.rotation.z += (targetRotZ - groupRef.current.rotation.z) * 0.15;
    const targetX = isMobile ? 0 : -0.46;
    groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.08;
    groupRef.current.position.y = CLUSTER_BASE_Y + Math.sin(elapsed * 0.45) * 0.08;
    const targetScale = broken ? 0.78 : 0.82;
    groupRef.current.scale.lerp(new Vector3(targetScale, targetScale, targetScale), 0.06);
  });

  return (
    <group ref={groupRef} position={[0, CLUSTER_BASE_Y, 0]} rotation={[0, -0.12, 0.02]} scale={0.9}>
      {balls.map((ball) => (
        <BallActorWithPhase key={ball.number} ball={ball} />
      ))}
      <CueBall />
      <CueStick />
    </group>
  );
}

function BallActorWithPhase({ ball }: { ball: BilliardBall }) {
  const groupRef = useRef<Group>(null);
  const texture = useMemo(
    () => makeBallTexture(ball.number, ball.color, ball.striped),
    [ball.color, ball.number, ball.striped],
  );

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const { broken, phase, phaseT } = computePhase(clock.getElapsedTime());

    let target: VectorTuple;
    let lerpAmount: number;
    if (broken) {
      target = ball.break;
      lerpAmount = phase === "broken" && phaseT < 0.2 ? 0.18 : 0.07;
    } else {
      target = ball.rack;
      lerpAmount = 0.12;
    }

    groupRef.current.position.lerp(new Vector3(target[0], target[1], target[2]), lerpAmount);
    groupRef.current.rotation.x += (broken ? 0.045 : 0.01) + ball.number * 0.0008;
    groupRef.current.rotation.y += broken ? 0.035 : 0.008;
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

export function BilliardsHero3D() {
  return (
    <div
      aria-hidden="true"
      data-testid="billiards-hero-3d"
      className="pointer-events-none absolute inset-x-0 top-0 z-[1] hidden h-[44vh] min-h-[300px] opacity-80 md:block md:inset-y-0 md:left-auto md:right-0 md:top-0 md:h-auto md:w-[54%] md:min-h-0 md:opacity-95 xl:right-[2%] xl:w-[48%]"
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
        style={{ width: "100%", height: "100%", pointerEvents: "none" }}
      >
        <PerspectiveCamera makeDefault position={[0, 0.1, 7.9]} fov={42} />
        <ambientLight intensity={0.75} />
        <directionalLight position={[-4, 5, 5]} intensity={2.1} color="#fff8df" castShadow />
        <pointLight position={[2.8, -1.6, 2.6]} intensity={1.6} color="#2EB958" />
        <pointLight position={[-2.4, 2.4, 2.2]} intensity={1.2} color="#ffffff" />
        <BallCluster />
      </Canvas>
    </div>
  );
}
