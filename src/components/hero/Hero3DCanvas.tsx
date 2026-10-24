import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Center } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { EmeraldGeometricMesh } from './EmeraldGeometricMesh';
import { isMobileDevice, shouldReduceMotion } from '../../utils/motion';

export const Hero3DCanvas: React.FC = () => {
  const isMobile = isMobileDevice();
  const reduceMotion = shouldReduceMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="h-[520px] w-[520px] rounded-full bg-emerald-500/10 blur-[120px]" />

      <Canvas
        camera={{ position: [0, 0, 5], fov: 38 }}
        dpr={isMobile ? 1 : [1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        className="absolute inset-0"
        style={{ transform: 'translate3d(18%, 0, 0) scale(1.2)' }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 5, 5]} intensity={2.5} color="#34D399" />
        <pointLight position={[-5, -5, -3]} intensity={1.0} color="#059669" />

        <Suspense fallback={null}>
          <Center>
            <EmeraldGeometricMesh />
          </Center>
        </Suspense>

        {!isMobile && !reduceMotion && (
          <EffectComposer>
            <Bloom intensity={0.5} luminanceThreshold={0.15} luminanceSmoothing={0.9} />
          </EffectComposer>
        )}

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          autoRotateSpeed={1.2}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </div>
  );
};
