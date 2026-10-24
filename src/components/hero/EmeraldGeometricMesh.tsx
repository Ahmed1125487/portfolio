import React, { useRef } from 'react';
import { Mesh } from 'three';
import { isMobileDevice } from '../../utils/motion';

export const EmeraldGeometricMesh: React.FC = () => {
  const meshRef = useRef<Mesh>(null);
  const isMobile = isMobileDevice();

  return (
    <group>
      <mesh ref={meshRef} scale={isMobile ? 1.35 : 1.8} position={[0, 0, 0]}>
        <torusKnotGeometry args={[1, 0.28, isMobile ? 80 : 160, 28]} />
        <meshStandardMaterial
          color="#10B981"
          emissive="#059669"
          emissiveIntensity={0.55}
          roughness={0.18}
          metalness={0.9}
          wireframe={true}
        />
      </mesh>

      <mesh scale={0.72}>
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial
          color="#34D399"
          emissive="#10B981"
          emissiveIntensity={0.8}
          roughness={0.08}
          metalness={0.95}
          wireframe={true}
        />
      </mesh>
    </group>
  );
};
