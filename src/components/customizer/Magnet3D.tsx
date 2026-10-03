"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  OrbitControls,
  RoundedBox,
} from "@react-three/drei";
import type { ProductId } from "@/lib/products";

interface Magnet3DProps {
  photoUrl: string | null;
  productId: ProductId;
}

interface MagnetSurfaceProps {
  texture: THREE.Texture | null;
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

export default function Magnet3D({ photoUrl, productId }: Magnet3DProps) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [1.5, 0.9, 4.2], fov: 34 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 6]} intensity={1.1} />
      <directionalLight position={[-6, -3, -4]} intensity={0.35} />
      <PhotoMagnet photoUrl={photoUrl} productId={productId} />
      <Environment resolution={64}>
        <Lightformer intensity={1.6} position={[0, 4, 5]} scale={[9, 4, 1]} />
        <Lightformer
          intensity={0.9}
          rotation-y={Math.PI / 2}
          position={[-5, 1, 0]}
          scale={[10, 7, 1]}
        />
        <Lightformer
          intensity={0.6}
          rotation-y={-Math.PI / 2}
          position={[5, -1, 0]}
          scale={[10, 7, 1]}
        />
      </Environment>
      <ContactShadows
        position={[0, -1.45, 0]}
        opacity={0.32}
        scale={7}
        blur={2.6}
        far={3.2}
        color="#0f172a"
      />
      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={2.6}
        maxDistance={7}
        minPolarAngle={0.35}
        maxPolarAngle={2.15}
        autoRotate
        autoRotateSpeed={0.9}
        enableDamping
        dampingFactor={0.08}
      />
    </Canvas>
  );
}

function PhotoMagnet({ photoUrl, productId }: Magnet3DProps) {
  const { texture } = usePhotoTexture(photoUrl);
  if (productId === "acrylic") {
    return <AcrylicMagnet texture={texture} />;
  }
  return <BoardMagnet texture={texture} />;
}

function AcrylicMagnet({ texture }: MagnetSurfaceProps) {
  const depth = 0.22;

  return (
    <group>
      <mesh position={[0, 0, -0.085]}>
        <planeGeometry args={[1.98, 1.98]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[1.94, 1.94]} />
        <meshStandardMaterial
          map={texture}
          color={texture ? "#ffffff" : "#bae6fd"}
          roughness={0.5}
          metalness={0}
        />
      </mesh>
      <RoundedBox args={[2, 2, depth]} radius={0.05} smoothness={5}>
        <meshPhysicalMaterial
          color="#eaf7ff"
          transparent
          opacity={0.42}
          roughness={0.06}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.05}
          ior={1.4}
          reflectivity={0.7}
          envMapIntensity={1.3}
        />
      </RoundedBox>
      <mesh position={[0, 0, -(depth / 2 + 0.02)]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.2, 0.2, 0.04, 32]} />
        <meshStandardMaterial color="#334155" roughness={0.55} />
      </mesh>
    </group>
  );
}

function BoardMagnet({ texture }: MagnetSurfaceProps) {
  return (
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
        <meshStandardMaterial
          map={texture}
          color={texture ? "#ffffff" : "#cbd5e1"}
          roughness={0.45}
          metalness={0}
        />
      </mesh>
      <mesh position={[0, 0, -0.065]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.2, 0.2, 0.04, 32]} />
        <meshStandardMaterial color="#334155" roughness={0.55} />
      </mesh>
    </group>
  );
}

function usePhotoTexture(photoUrl: string | null) {
  const [loaded, setLoaded] = useState<{
    url: string;
    texture: THREE.Texture;
    aspect: number;
  } | null>(null);

  useEffect(() => {
    if (!photoUrl) return;

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
      const aspect = width / height || 1;
      applyCoverUV(texture, aspect);
      setLoaded({ url: photoUrl, texture, aspect });
    });

    return () => {
      active = false;
    };
  }, [photoUrl]);

  useEffect(() => {
    const current = loaded?.texture;
    return () => {
      current?.dispose();
    };
  }, [loaded]);

  if (!photoUrl || !loaded) {
    return { texture: null as THREE.Texture | null, aspect: 1 };
  }
  return { texture: loaded.texture, aspect: loaded.aspect };
}
