import './style2.css';
import React, { useState, useEffect, useRef } from 'react';
import { IFCLoader } from 'web-ifc-three/IFCLoader';
import * as THREE from 'three';
import { useGrid } from '../../hooks/useGrid';
import { useAtom } from 'jotai';
import { mapAtom, socket } from '../SocketManager';
import { atom, useAtomValue } from 'jotai';

// Create atoms for sharing state between components
export const ifcFileDataAtom = atom(null);
export const ifcErrorAtom = atom(null);
export const isIfcModelLoadedAtom = atom(false);
export const ifcModelVisibilityAtom = atom(true);

// New Table component
export function Table({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
    return (
    <group position={position} rotation={rotation}>
      {/* Base map */}
      <mesh position={[0, 1.2, 0]} >
        <boxGeometry args={[2, 0.1, 1]} />
        <meshStandardMaterial color={'#ffffff'} castShadow/>
      </mesh>

      {/* Table leg */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[0.3, 1.2, 0.3]} />
        <meshStandardMaterial color={'#ffffff'} castShadow/>
      </mesh>
    </group>
    );
}

// The component that handles the 3D model
export function IFCModelViewer2() {
    const fileData = useAtomValue(ifcFileDataAtom);
    const [, setError] = useAtom(ifcErrorAtom);
    const [, setIsModelLoaded] = useAtom(isIfcModelLoadedAtom);
    const [model, setModel] = useState(null);
    const [isVisible, setIsVisible] = useAtom(ifcModelVisibilityAtom);
    const { gridToVector3 } = useGrid();
    const [map] = useAtom(mapAtom);


    const loadIFCModel2 = async (data) => {
        let ifcLoader = null;
        try {
            ifcLoader = new IFCLoader();
            await ifcLoader.ifcManager.setWasmPath('/wasm/');
            
            const queryParams = new URLSearchParams(window.location.search);
            const roomIdFromUrl = queryParams.get("Id"); 

            let modelPath = "/models/3.ifc";
            if(roomIdFromUrl == "123ABC"){
                modelPath = "/models/1.ifc";
            }else{
                modelPath = "/models/3.ifc";    
            }
            const response = await fetch(modelPath);
            const loadedModel = await ifcLoader.loadAsync(modelPath);
            console.log(loadedModel);
            
            // if (!data || !data.buffer) {
            //     throw new Error('No IFC data provided');
            // }
            
            
            // const buffer = new Uint8Array(data.buffer).buffer;
            // const loadedModel = await ifcLoader.parse(buffer);
            
            if (!loadedModel) {
                throw new Error('Failed to parse IFC model');
            }
            if (!loadedModel.geometry) {
                throw new Error('IFC model has no geometry');
            }

            // Create a default material if none exists
            // if (!loadedModel.material) {
                loadedModel.material = new THREE.MeshPhongMaterial({
                    color: "#64b5f6",
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.2,
                    depthWrite: false,
                    polygonOffset: true,
                    polygonOffsetFactor: 1,
                    polygonOffsetUnits: 1,
                });
            // }

            // Create a container for the model
            const modelContainer = new THREE.Group();
            modelContainer.add(loadedModel);

            // Calculate bounding box for scaling
            const bbox = new THREE.Box3().setFromObject(loadedModel);
            const size = new THREE.Vector3();
            bbox.getSize(size);

            // Center the model at origin first
            const center = new THREE.Vector3();
            bbox.getCenter(center);
            loadedModel.position.sub(center);

            // Scale model to fit on table
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 1.5 / maxDim;
            modelContainer.scale.setScalar(scale);

            // Position the model on a table
            const tablePosition = new THREE.Vector3(12, (1.25 + ((size.y * scale)/2)), 10);
            // const tablePosition = getTablePosition2();
            modelContainer.position.copy(tablePosition);
            // Adjust final height to be on table surface
            // modelContainer.position.y = 2;

            // Add some rotation to make it more visible
            // modelContainer.rotation.y = 45; // 45 degrees rotation

            // Ensure model casts and receives shadows
            modelContainer.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    // Enhance material for better visibility
                    if (child.material) {
                        child.material.side = THREE.DoubleSide;
                        child.material.needsUpdate = true;
                    }
                }
            });

            setModel(modelContainer);
            setIsModelLoaded(true);
            setError(null);
        } catch (error) {
            console.error('Error loading IFC:', error);
            if (ifcLoader && ifcLoader.ifcManager) {
                try {
                    await ifcLoader.ifcManager.dispose();
                } catch (disposeError) {
                    console.error('Error disposing IFC manager:', disposeError);
                }
            }
            setError(error.message);
        }
    };

    // Listen for IFC data and visibility updates from other users
    useEffect(() => {
        loadIFCModel2(null);
        // const handleReceivedIFC = (data) => {
        //     console.log("Received IFC model from another user");
        //     loadIFCModel2(data);
        // };

        // const handleVisibilityUpdate = (visibility) => {
        //     console.log("Received visibility update:", visibility);
        //     setIsVisible(visibility);
        // };

        // socket.on('receiveIFC2', handleReceivedIFC);
        // socket.on('ifcVisibilityUpdate2', handleVisibilityUpdate);

        // // Request existing IFC model when joining
        // socket.emit('requestIFC2');

        // return () => {
        //     socket.off('receiveIFC2', handleReceivedIFC);
        //     socket.off('ifcVisibilityUpdate2', handleVisibilityUpdate);
        // };
    }, []);

    useEffect(() => {
        if (fileData) {
            loadIFCModel2(fileData);
        }
    }, [fileData]);

    // Update model visibility
    useEffect(() => {
        if (model) {
            model.visible = isVisible;
        }
    }, [model, isVisible]);

    return (
        <>
            {model ? <primitive object={model} /> : null}
            <Table position={[12, 0, 10]} rotation={[0, 0, 0]} />
        </>
    );
}

// The UI component for file selection
export function IfcLoader2() {
    const [, setFileData] = useAtom(ifcFileDataAtom);
    const [error] = useAtom(ifcErrorAtom);
    const [isModelLoaded] = useAtom(isIfcModelLoadedAtom);
    const [isVisible, setIsVisible] = useAtom(ifcModelVisibilityAtom);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            if (!file.name.toLowerCase().endsWith('.ifc')) {
                throw new Error('Please select an IFC file');
            }

            console.log("Reading IFC file:", file.name);
            const arrayBuffer = await file.arrayBuffer();
            
            if (!arrayBuffer || arrayBuffer.byteLength === 0) {
                throw new Error('Selected file is empty');
            }

            // Convert ArrayBuffer to Array for socket transmission
            const buffer = Array.from(new Uint8Array(arrayBuffer));
            const data = {
                buffer,
                fileName: file.name
            };

            // Share with other users
            socket.emit('shareIFC2', data);

            // Load locally
            setFileData(data);
        } catch (error) {
            console.error('Error reading IFC file:', error);
            setFileData(null);
        }

    };

    const toggleVisibility = () => {
        const newVisibility = !isVisible;
        setIsVisible(newVisibility);
        // Broadcast visibility change to other users
        // socket.emit('toggleIfcVisibility2', newVisibility);
    };

    return (

        <div style={{ 
            position: 'absolute', 
            bottom: '330px', 
            left: '20px', 
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '10px'
        }}>
            <input
                type="file"
                accept=".ifc"
                onChange={handleFileSelect}
                ref={fileInputRef}
                style={{ display: 'none' }}
            />

            {!isModelLoaded && (
                <button 
                    className="load-button" 
                    onClick={() => fileInputRef.current?.click()}
                    title="Load IFC Model"
                >
                    <span className="sr-only">Load IFC Model</span>
                </button>
            )}

            {isModelLoaded && (
                <button 
                    className={`load-button ${!isVisible ? 'load-button-hidden' : ''}`}
                    onClick={toggleVisibility}
                    title={isVisible ? "Hide IFC Model" : "Show IFC Model"}
                >
                    <span className="sr-only">
                        {isVisible ? "Hide IFC Model" : "Show IFC Model"}
                    </span>
                </button>
            )}

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}
        </div>
    );
}

export default IfcLoader2;

