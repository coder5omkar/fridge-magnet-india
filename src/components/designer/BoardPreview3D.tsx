"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  OrbitControls,
  RoundedBox,
} from "@react-three/drei";
import type { BoardColor } from "@/lib/fitting";

interface BoardPreview3DProps {
  photoUrl: string;
  boardColor: BoardColor;
  boardAspect: number;
}

type TextureStatus = "loading" | "ready" | "failed";

function applyCoverUV(
  texture: THREE.Texture,
  textureAspect: number,
  planeAspect: number
) {
  const photo = textureAspect > 0 ? textureAspect : 1;
  const plane = planeAspect > 0 ? planeAspect : 1;
  if (photo >= plane) {
    const repeatX = plane / photo;
    texture.repeat.set(repeatX, 1);
    texture.offset.set((1 - repeatX) / 2, 0);
  } else {
    const repeatY = photo / plane;
    texture.repeat.set(1, repeatY);
    texture.offset.set(0, (1 - repeatY) / 2);
  }
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
}

function configureRenderer(gl: THREE.WebGLRenderer) {
  gl.toneMapping = THREE.ACESFilmicToneMapping;
  gl.toneMappingExposure = 1.18;
}

function RendererSettings() {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    configureRenderer(gl);
  }, [gl]);

  return null;
}

export default function BoardPreview3D({
  photoUrl,
  boardColor,
  boardAspect,
}: BoardPreview3DProps) {
  const { texture, status, retry } = usePhotoTexture(photoUrl, boardAspect);
  const board = boardAspect > 0 ? boardAspect : 1;
  const boardWidth = board >= 1 ? 2 : 2 * board;
  const boardHeight = board >= 1 ? 2 / board : 2;
  const bodyColor = boardColor === "white" ? "#ffffff" : "#111827";
  const shadowY = -(boardHeight / 2) - 0.42;
  const faceColor = texture
    ? "#ffffff"
    : boardColor === "white"
      ? "#f1f5f9"
      : "#1f2937";

  return (
    <div className="relative h-full w-full">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [1.35, 0.75, 4.1], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
        style={{ touchAction: "pan-y" }}
      >
        <RendererSettings />
        <ambientLight intensity={0.9} />
        <directionalLight position={[4, 6, 6]} intensity={1.4} />
        <directionalLight position={[-5, -2, 4]} intensity={0.55} />
        <directionalLight position={[-4, 3, -5]} intensity={0.4} />
        <group>
          <RoundedBox
            args={[boardWidth, boardHeight, 0.09]}
            radius={0.025}
            smoothness={4}
          >
            <meshStandardMaterial color={bodyColor} roughness={0.62} />
          </RoundedBox>
          <mesh position={[0, 0, 0.048]}>
            <planeGeometry args={[boardWidth * 0.985, boardHeight * 0.985]} />
            <meshBasicMaterial
              map={texture}
              color={faceColor}
              toneMapped={false}
            />
          </mesh>
          <mesh position={[0, 0, -0.065]} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[0.2, 0.2, 0.04, 32]} />
            <meshStandardMaterial color="#334155" roughness={0.55} />
          </mesh>
        </group>
        <Environment resolution={64}>
          <Lightformer intensity={1.8} position={[0, 4, 5]} scale={[9, 4, 1]} />
          <Lightformer
            intensity={1}
            rotation-y={Math.PI / 2}
            position={[-5, 1, 0]}
            scale={[10, 7, 1]}
          />
          <Lightformer
            intensity={0.8}
            rotation-y={-Math.PI / 2}
            position={[5, 1, 0]}
            scale={[10, 7, 1]}
          />
        </Environment>
        <ContactShadows
          position={[0, shadowY, 0]}
          opacity={0.28}
          scale={7}
          blur={3}
          far={3}
          color="#0f172a"
        />
        <OrbitControls
          makeDefault
          enablePan={false}
          minDistance={2.4}
          maxDistance={6.5}
          minPolarAngle={0.35}
          maxPolarAngle={2.15}
          autoRotate
          autoRotateSpeed={0.75}
          enableDamping
          dampingFactor={0.08}
        />
      </Canvas>

      {status === "loading" ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="rounded-full bg-slate-900/60 px-3 py-1 text-[11px] font-medium text-white">
            Loading photo...
          </span>
        </div>
      ) : null}

      {status === "failed" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-100/85 px-6 text-center">
          <p className="text-xs font-medium text-slate-600">
            The photo preview did not load.
          </p>
          <button
            type="button"
            onClick={retry}
            className="rounded-lg bg-ocean-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-ocean-700"
          >
            Retry
          </button>
        </div>
      ) : null}
    </div>
  );
}

function usePhotoTexture(photoUrl: string, boardAspect: number) {
  const [loaded, setLoaded] = useState<{
    url: string;
    texture: THREE.Texture;
    aspect: number;
  } | null>(null);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const loader = new THREE.TextureLoader();
    loader.load(
      photoUrl,
      (texture) => {
        if (!active) {
          texture.dispose();
          return;
        }
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 8;
        const width = texture.image?.width ?? 1;
        const height = texture.image?.height ?? 1;
        setLoaded({ url: photoUrl, texture, aspect: width / height || 1 });
      },
      undefined,
      () => {
        if (active) setFailedUrl(photoUrl);
      }
    );
    return () => {
      active = false;
    };
  }, [photoUrl, attempt]);

  useEffect(() => {
    if (loaded) {
      applyCoverUV(loaded.texture, loaded.aspect, boardAspect);
    }
  }, [loaded, boardAspect]);

  useEffect(() => {
    const current = loaded?.texture;
    return () => {
      current?.dispose();
    };
  }, [loaded]);

  const failed = failedUrl === photoUrl;
  const texture = !failed && loaded?.url === photoUrl ? loaded.texture : null;
  const status: TextureStatus = failed
    ? "failed"
    : texture
      ? "ready"
      : "loading";

  function retry() {
    setFailedUrl(null);
    setAttempt((value) => value + 1);
  }

  return { texture, status, retry };
}
