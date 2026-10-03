"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls, RoundedBox } from "@react-three/drei";

interface BoardPreview3DProps {
  photoUrl: string;
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

export default function BoardPreview3D({ photoUrl }: BoardPreview3DProps) {
  const texture = usePhotoTexture(photoUrl);

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [1.3, 0.8, 4.4], fov: 32 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 6]} intensity={1.05} />
      <directionalLight position={[-5, -3, -4]} intensity={0.3} />
      <group>
        <RoundedBox args={[2, 2, 0.09]} radius={0.025} smoothness={4}>
          <meshStandardMaterial color="#f8fafc" roughness={0.75} />
        </RoundedBox>
        <mesh position={[0, 0, 0.046]}>
          <planeGeometry args={[1.97, 1.97]} />
          <meshStandardMaterial color="#ffffff" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.048]}>
          <planeGeometry args={[1.88, 1.88]} />
          <meshStandardMaterial map={texture} roughness={0.5} metalness={0} />
        </mesh>
        <mesh position={[0, 0, -0.065]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.2, 0.2, 0.04, 32]} />
          <meshStandardMaterial color="#334155" roughness={0.55} />
        </mesh>
      </group>
      <ContactShadows
        position={[0, -1.42, 0]}
        opacity={0.3}
        scale={7}
        blur={2.6}
        far={3}
        color="#0f172a"
      />
      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={2.7}
        maxDistance={7}
        minPolarAngle={0.35}
        maxPolarAngle={2.15}
        autoRotate
        autoRotateSpeed={0.8}
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
