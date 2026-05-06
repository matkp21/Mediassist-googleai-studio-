"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Grid } from "@react-three/drei";
import { useRef, Suspense } from "react";
import * as THREE from "three";

function ARContext({ color }: { color: string }) {
  const scannerRef = useRef<THREE.Group>(null!);
  useFrame((state) => {
    if (scannerRef.current) {
      scannerRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 1.3;
    }
  });

  return (
    <group>
      {/* High-tech Floor Grid */}
      <Grid 
        position={[0, -1.8, 0]} 
        args={[10, 10]} 
        cellSize={0.2} 
        cellThickness={1} 
        cellColor={color} 
        sectionSize={1.0} 
        sectionThickness={1.5} 
        sectionColor={color} 
        fadeDistance={4.5} 
        fadeStrength={1} 
      />
      
      {/* Scanning Ring */}
      <group ref={scannerRef}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 1.55, 64]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0, 1.5, 64]} />
          <meshBasicMaterial color={color} transparent opacity={0.08} side={THREE.DoubleSide} />
        </mesh>
        <pointLight color={color} intensity={2} distance={3} />
      </group>

      {/* AR Corner Brackets */}
      <group scale={1.5}>
        {[-1, 1].map((x) => 
          [-1, 1].map((y) => (
            <group key={`corner-${x}-${y}`} position={[x, y, 0]}>
              <mesh position={[-x * 0.1, 0, 0]}>
                <boxGeometry args={[0.2, 0.02, 0.02]} />
                <meshBasicMaterial color={color} transparent opacity={0.6} />
              </mesh>
              <mesh position={[0, -y * 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
                <boxGeometry args={[0.2, 0.02, 0.02]} />
                <meshBasicMaterial color={color} transparent opacity={0.6} />
              </mesh>
            </group>
          ))
        )}
      </group>
    </group>
  );
}

function Organ({ shape = "brain", color = "#00E5FF" }: { shape?: "brain" | "heart" | "skeleton" | "dna", color?: string }) {
  const ref = useRef<THREE.Group>(null!);
  useFrame((s) => {
    if (!ref.current) return;
    ref.current.rotation.y = s.clock.elapsedTime * 0.4;
    ref.current.rotation.x = Math.sin(s.clock.elapsedTime * 0.5) * 0.3;
  });

  if (shape === "heart") {
    return (
      <group ref={ref} scale={0.9}>
        <mesh>
          <torusKnotGeometry args={[0.7, 0.28, 128, 24, 2, 3]} />
          <MeshDistortMaterial color="#220" emissive={color} emissiveIntensity={0.7} distort={0.25} speed={2} roughness={0.25} metalness={0.6} />
        </mesh>
      </group>
    );
  }
  if (shape === "skeleton") {
    return (
      <group ref={ref}>
        <mesh>
          <cylinderGeometry args={[0.18, 0.32, 1.6, 16]} />
          <meshStandardMaterial color="#1a1d24" emissive={color} emissiveIntensity={0.35} roughness={0.4} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0.85, 0]}>
          <sphereGeometry args={[0.32, 24, 24]} />
          <meshStandardMaterial color="#222" emissive={color} emissiveIntensity={0.45} roughness={0.4} metalness={0.5} />
        </mesh>
        <mesh position={[0, -0.95, 0]}>
          <sphereGeometry args={[0.4, 24, 24]} />
          <meshStandardMaterial color="#1a1d24" emissive={color} emissiveIntensity={0.4} roughness={0.4} metalness={0.5} />
        </mesh>
      </group>
    );
  }
  if (shape === "dna") {
    return (
      <group ref={ref} scale={0.7} rotation={[0, 0, Math.PI / 4]}>
        {Array.from({ length: 10 }).map((_, i) => {
          const y = (i - 4.5) * 0.35;
          const a = i * 0.6;
          const x = Math.sin(a) * 0.5;
          const z = Math.cos(a) * 0.5;
          return (
            <group key={i}>
              <mesh position={[x, y, z]}>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshStandardMaterial color="#1a1d24" emissive={color} emissiveIntensity={0.6} roughness={0.3} metalness={0.8} />
              </mesh>
              <mesh position={[-x, y, -z]}>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshStandardMaterial color="#1a1d24" emissive={color} emissiveIntensity={0.6} roughness={0.3} metalness={0.8} />
              </mesh>
              <mesh position={[0, y, 0]} rotation={[0, -a, Math.PI / 2]}>
                <cylinderGeometry args={[0.04, 0.04, 1.0, 8]} />
                <meshBasicMaterial color={color} transparent opacity={0.4} />
              </mesh>
            </group>
          );
        })}
      </group>
    );
  }
  // brain default
  return (
    <group ref={ref}>
      <mesh>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial color="#0a1c24" emissive={color} emissiveIntensity={0.55} distort={0.55} speed={2} roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh scale={1.35}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

export const MiniOrgan = ({ shape = "brain", color = "#00E5FF", height = 220 }: { shape?: "brain" | "heart" | "skeleton" | "dna", color?: string, height?: number | string }) => {
  return (
    <div style={{ height, width: "100%" }} className="relative">
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 3.4], fov: 40 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[3, 3, 3]} intensity={1.4} color={color} />
        <pointLight position={[-3, -2, 1]} intensity={0.5} color="#ffffff" />
        
        {/* AR Environment Elements */}
        <ARContext color={color} />
        
        <Suspense fallback={null}>
          <Float speed={1.4} rotationIntensity={0.3} floatIntensity={0.5}>
            <Organ shape={shape} color={color} />
          </Float>
        </Suspense>
      </Canvas>
    </div>
  );
};

export default MiniOrgan;
