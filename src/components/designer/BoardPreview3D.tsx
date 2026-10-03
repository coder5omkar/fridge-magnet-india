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
}

function applyCoverUV(texture: THREE.Texture, aspect: number) {
  if (aspect >= 1) {
    texture.repeat.set(1 / aspect, 1);
    texture.offset.set((1 - 1 / aspect) / 2, 0);
  } else {
    texture.repeat.set(1, aspect);
    texture.offset.set(0, (1 - aspect) / 2);
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
}: BoardPreview3DProps) {
  const texture = usePhotoTexture(photoUrl);
  const bodyColor = boardColor === "white" ? "#ffffff" : "#111827";
  const frameColor = boardColor === "white" ? "#f8fafc" : "#1f2937";

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [1.35, 0.75, 3.9], fov: 35 }}
      gl={{ antialias: true, alpha: true }}
    >
      <RendererSettings />
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 6, 6]} intensity={1.4} />
      <directionalLight position={[-5, -2, 4]} intensity={0.55} />
      <directionalLight position={[-4, 3, -5]} intensity={0.4} />
      <group>
        <RoundedBox args={[2, 2, 0.09]} radius={0.025} smoothness={4}>
          <meshStandardMaterial color={bodyColor} roughness={0.62} />
        </RoundedBox>
        <mesh position={[0, 0, 0.046]}>
          <planeGeometry args={[1.97, 1.97]} />
          <meshStandardMaterial color={frameColor} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.048]}>
          <planeGeometry args={[1.88, 1.88]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
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
        position={[0, -1.42, 0]}
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

function usePhotoTexture(photoUrl: string) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let active = true;
    const loader = new THREE.TextureLoader();
    loader.load(photoUrl, (loaded) => {
      if (!active) {
        loaded.dispose();
        return;
      }
      loaded.colorSpace = THREE.SRGBColorSpace;
      loaded.anisotropy = 8;
      const width = loaded.image?.width ?? 1;
      const height = loaded.image?.height ?? 1;
      applyCoverUV(loaded, width / height || 1);
      setTexture(loaded);
    });
    return () => {
      active = false;
    };
  }, [photoUrl]);

  useEffect(() => {
    const current = texture;
    return () => {
      current?.dispose();
    };
  }, [texture]);

  return texture;
}
