import React, { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';


// The component that handles the 3D model
export function GLBModelViewer() {
    const groupRef = useRef();
    const [model, setModel] = useState(null);
    const mixer = useRef(null);
    const pathProgress = useRef(0);

    // Define path waypoints
    const path = [
        new THREE.Vector3(10.1, 0, 2.2),
        new THREE.Vector3(1.8, 0, 2.2),
        new THREE.Vector3(1.8, 0, 5.1),
        new THREE.Vector3(10.1, 0, 5.1)
    ];

    // Load the GLB model
    const { scene, animations } = useGLTF('/models/robot/robot_anim.glb');

    // Initial model setup
    useEffect(() => {
        if (!scene) return;
        try {
            scene.scale.setScalar(1);

            // Setup animation mixer and play animations[1]
            if (animations && animations.length > 1) {
                mixer.current = new THREE.AnimationMixer(scene);
                const action = mixer.current.clipAction(animations[2]);
                action.play();
            }
            setModel(scene);
        } catch (error) {
            console.error('Error setting up GLB model:', error);
        }
    }, [scene, animations]);

    // Update animations
    useFrame((state, delta) => {
        if (mixer.current) {
            mixer.current.update(delta);
        }

        // Update path following
        if (model && groupRef.current) {
            // if((pathProgress.current >= 1 && pathProgress.current <= 2) || (pathProgress.current >= 3 && pathProgress.current <= 4)) {
            //     pathProgress.current += delta * 0.4; // Speed of movement
            // } else {
            //     pathProgress.current += delta * 0.15;
            // }
            pathProgress.current += delta * 0.15;
            if (pathProgress.current >= path.length - 1) pathProgress.current = 0;
            
            // Create a smooth curve through all waypoints
            const curve = new THREE.CatmullRomCurve3(path, true, 'catmullrom', 0.4); // Added tension parameter
            
            // Get position on the curve
            const t = pathProgress.current / (path.length - 1);
            const point = curve.getPointAt(t);
            const tangent = curve.getTangentAt(t);
            
            // Update model position
            model.position.set(point.x, 0, point.z);
            
            // Calculate direction for rotation
            if (tangent.length() > 0) {
                const angle = Math.atan2(tangent.x, tangent.z);
                model.rotation.y = angle;
            }
        }
    });

    return model ? (
        <group ref={groupRef} position={[0, 0, 0]}>
            <primitive object={model} />
        </group>
    ) : null;
}


// Main component
export function GlbLoader() {
    return (
        <>
            <GLBModelViewer />
        </>
    );
}

// Preload the model
useGLTF.preload('/models/robot/robot_anim.glb');

export default GlbLoader;