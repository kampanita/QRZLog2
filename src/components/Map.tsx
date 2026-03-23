import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import * as THREE from 'three';
import { MapPin, Globe, Radio, Activity } from 'lucide-react';

export default function Map() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvasRef.current.clientWidth / canvasRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);

    // Create Globe
    const geometry = new THREE.SphereGeometry(5, 32, 32);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0xacc7ff, 
      wireframe: true, 
      transparent: true, 
      opacity: 0.2 
    });
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    // Add some "Signal" points
    const points: THREE.Mesh[] = [];
    for (let i = 0; i < 20; i++) {
      const pointGeom = new THREE.SphereGeometry(0.1, 8, 8);
      const pointMat = new THREE.MeshBasicMaterial({ color: 0xffb4a3 });
      const point = new THREE.Mesh(pointGeom, pointMat);
      
      const phi = Math.acos(-1 + (2 * i) / 20);
      const theta = Math.sqrt(20 * Math.PI) * phi;
      
      point.position.setFromSphericalCoords(5.1, phi, theta);
      globe.add(point);
      points.push(point);
    }

    camera.position.z = 10;

    const animate = () => {
      requestAnimationFrame(animate);
      globe.rotation.y += 0.002;
      globe.rotation.x += 0.001;
      
      points.forEach((p, i) => {
        p.scale.setScalar(1 + Math.sin(Date.now() * 0.005 + i) * 0.5);
      });
      
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!canvasRef.current) return;
      camera.aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex flex-col space-y-6 px-6"
    >
      <div className="pt-4">
        <h1 className="text-4xl font-display font-medium tracking-tight text-white italic">
          Global <span className="text-accent">Signal Map</span>
        </h1>
        <p className="text-muted text-sm font-mono uppercase tracking-widest mt-1">
          VISUALIZACIÓN DE PROPAGACIÓN Y CONTACTOS EN TIEMPO REAL
        </p>
      </div>

      <div className="flex-1 glass-panel relative overflow-hidden min-h-[500px]">
        <canvas ref={canvasRef} className="w-full h-full" />
        
        <div className="absolute top-8 left-8 space-y-4">
          <div className="glass-panel p-4 border-l-2 border-accent">
            <div className="flex items-center gap-3 mb-1">
              <Globe className="text-accent" size={16} />
              <span className="text-[10px] font-mono uppercase tracking-widest text-white">Active Nodes</span>
            </div>
            <p className="text-2xl font-display text-white">1,248</p>
          </div>
          <div className="glass-panel p-4 border-l-2 border-tertiary">
            <div className="flex items-center gap-3 mb-1">
              <Radio className="text-tertiary" size={16} />
              <span className="text-[10px] font-mono uppercase tracking-widest text-white">Live Signals</span>
            </div>
            <p className="text-2xl font-display text-white">42</p>
          </div>
        </div>

        <div className="absolute bottom-8 right-8">
          <div className="glass-panel p-6 max-w-xs space-y-4">
            <div className="flex items-center gap-3">
              <Activity className="text-emerald-500 animate-pulse" size={20} />
              <h3 className="font-display text-white uppercase tracking-tight">System Status</h3>
            </div>
            <p className="text-xs text-muted font-mono leading-relaxed uppercase tracking-widest">
              Calibrando sensores de ionosfera... Escaneando bandas V-UHF para detección de aperturas esporádicas.
            </p>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-accent"
                animate={{ width: ['0%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
