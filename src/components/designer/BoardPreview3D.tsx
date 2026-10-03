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
  const texture = usePhotoTexture(photoUrl, boardAspect);
  const board = boardAspect > 0 ? boardAspect : 1;
  const boardWidth = board >= 1 ? 2 : 2 * board;
  const boardHeight = board >= 1 ? 2 / board : 2;
  const bodyColor = boardColor === "white" ? "#ffffff" : "#111827";
  const shadowY = -(boardHeight / 2) - 0.42;

  return (
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
          <meshBasicMaterial map={texture} color="#ffffff" toneMapped={false} />
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
  );
}

function usePhotoTexture(photoUrl: string, boardAspect: number) {
  const [loaded, setLoaded] = useState<{
    texture: THREE.Texture;
    aspect: number;
  } | null>(null);

  useEffect(() => {
    let active = true;
    const loader = new THREE.TextureLoader();
    loader.load(photoUrl, (texture) => {
      if (!active) {
        texture.dispose();
        return;
      }
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
      const width = texture.image?.width ?? 1;
      const height = texture.image?.height ?? 1;
      setLoaded({ texture, aspect: width / height || 1 });
    });
    return () => {
      active = false;
    };
  }, [photoUrl]);

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

  return loaded?.texture ?? null;
}
