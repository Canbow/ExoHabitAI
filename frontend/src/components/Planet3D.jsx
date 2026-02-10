import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, OrbitControls, Sparkles } from '@react-three/drei';

function PlanetMesh({ data, isHabitable }) {
  const meshRef = useRef();
  const atmosphereRef = useRef();

  // 1. EXTRACT DATA
  const radius = parseFloat(data.Radius || 1.0);
  const temp = parseFloat(data.EqTemp || 288);

  // 2. DETERMINE PLANET BIOME (THE "LOGIC")
  const biome = useMemo(() => {
    // A. Gas Giant (Too Big)
    if (radius > 1.6) {
      return {
        color: "#8b5cf6",       // Purple
        emissive: "#2e1065",    // Dark Purple Glow
        roughness: 1.0,         // Matte (Gas)
        atmosphereColor: "#c4b5fd",
        atmosphereOpacity: 0.6, // Thick Atmosphere
        type: "GAS GIANT",
        particles: "#a78bfa"
      };
    }
    // B. Lava World (Too Hot)
    if (temp > 330) {
      return {
        color: "#7f1d1d",       // Dark Red
        emissive: "#ef4444",    // Bright Red Glow (Lava)
        roughness: 0.9,         // Rocky
        atmosphereColor: "#fcd34d", // Sulfuric Clouds
        atmosphereOpacity: 0.2,
        type: "MOLTEN WORLD",
        particles: "#f87171"    // Embers
      };
    }
    // C. Ice World (Too Cold)
    if (temp < 200) {
      return {
        color: "#ecfeff",       // White/Cyan
        emissive: "#000000",    // No Glow
        roughness: 0.1,         // Very Shiny (Ice)
        atmosphereColor: "#a5f3fc",
        atmosphereOpacity: 0.3,
        type: "ICE WORLD",
        particles: "#ffffff"    // Snow/Ice crystals
      };
    }
    // D. Earth-like (Habitable)
    return {
      color: "#1e40af",         // Ocean Blue
      emissive: "#000000",      // No Glow
      roughness: 0.4,           // Water reflection
      atmosphereColor: "#ffffff", // White Clouds
      atmosphereOpacity: 0.3,
      type: "TERRA CLASS",
      particles: "#ffffff"
    };
  }, [radius, temp]);

  // Auto-Rotate
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005; 
    }
    if (atmosphereRef.current) {
      // Atmosphere moves slightly faster/slower than planet
      atmosphereRef.current.rotation.y += 0.007; 
      atmosphereRef.current.rotation.z = Math.sin(t / 2) * 0.05; // Slight wobble
    }
  });

  return (
    <group>
      {/* 1. PLANET SURFACE */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2.2, 64, 64]} />
        <meshStandardMaterial 
          color={biome.color}
          emissive={biome.emissive}
          emissiveIntensity={biome.type === "MOLTEN WORLD" ? 2 : 0} // Make lava glow!
          roughness={biome.roughness}
          metalness={biome.type === "ICE WORLD" ? 0.8 : 0.2} // Ice is reflective
        />
      </mesh>

      {/* 2. ATMOSPHERE / CLOUDS */}
      <mesh ref={atmosphereRef} scale={[1.05, 1.05, 1.05]}>
        <sphereGeometry args={[2.2, 64, 64]} />
        <meshStandardMaterial 
          color={biome.atmosphereColor}
          transparent 
          opacity={biome.atmosphereOpacity}
          roughness={1}
        />
      </mesh>

      {/* 3. PARTICLE EFFECTS (Snow/Ash/Gas) */}
      <Sparkles 
        count={50} 
        scale={6} 
        size={4} 
        speed={0.4} 
        opacity={0.5} 
        color={biome.particles} 
      />
    </group>
  );
}

export default function Planet3D({ data, isHabitable }) {
  return (
    <div className="w-full h-full min-h-[300px] cursor-move">
      <Canvas camera={{ position: [0, 0, 6] }}>
        <ambientLight intensity={0.4} />
        {/* Sun Light Source */}
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#xffe" />
        {/* Backlight (Rim Light) */}
        <pointLight position={[-10, -5, -10]} intensity={0.5} color="#4c1d95" />
        
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        
        <PlanetMesh data={data} isHabitable={isHabitable} />
        
        <OrbitControls enableZoom={false} autoRotate={false} />
      </Canvas>
    </div>
  );
}