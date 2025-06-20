import './style.css';
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

// The component that handles the 3D model
export function IFCModelViewer() {
    const fileData = useAtomValue(ifcFileDataAtom);
    const [, setError] = useAtom(ifcErrorAtom);
    const [, setIsModelLoaded] = useAtom(isIfcModelLoadedAtom);
    const [model, setModel] = useState(null);
    const [isVisible, setIsVisible] = useAtom(ifcModelVisibilityAtom);
    const { gridToVector3 } = useGrid();
    const [map] = useAtom(mapAtom);

    // Find the first table position
    const getTablePosition = () => {
        const table = map.items.find(item => item.name === 'udlTableChair');
        if (table) {
            console.log("Found table:", table);
            // Get the center position of the table
            const position = gridToVector3(table.gridPosition, table.size[0], table.size[1]);
            // Adjust height to place on table surface
            position.y = 0.75; // Table height
            console.log("Table position:", position);
            return position;
        }
        console.warn("No table found in map!");
        return new THREE.Vector3(0, 0, 0);
    };

    const loadIFCModel = async (data) => {
        let ifcLoader = null;
        try {
            console.log("Initializing IFC loader...");
            ifcLoader = new IFCLoader();
            await ifcLoader.ifcManager.setWasmPath('/wasm/');
            
            if (!data || !data.buffer) {
                throw new Error('No IFC data provided');
            }
            
            console.log(`Loading IFC file: ${data.fileName}`);
            const buffer = new Uint8Array(data.buffer).buffer;
            console.log(`IFC file size: ${(buffer.byteLength / 1024 / 1024).toFixed(2)} MB`);
            
            console.log("Parsing IFC data...");
            const loadedModel = await ifcLoader.parse(buffer);
            
            if (!loadedModel) {
                throw new Error('Failed to parse IFC model');
            }

            console.log("Validating model...");
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
            console.log("Original model size:", size);

            // Center the model at origin first
            const center = new THREE.Vector3();
            bbox.getCenter(center);
            loadedModel.position.sub(center);

            // Scale model to fit on table
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 2 / maxDim;
            modelContainer.scale.setScalar(scale);
            console.log("Applied scale:", scale);

            // Position the model on a table
            const tablePosition = getTablePosition();
            modelContainer.position.copy(tablePosition);
            // Adjust final height to be on table surface
            modelContainer.position.y = 1; // Table height
            console.log("Final model position:", modelContainer.position);

            // Add some rotation to make it more visible
            modelContainer.rotation.y = 45; // 45 degrees rotation

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

            console.log("Model loaded successfully!");
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
        const handleReceivedIFC = (data) => {
            console.log("Received IFC model from another user");
            loadIFCModel(data);
        };

        const handleVisibilityUpdate = (visibility) => {
            console.log("Received visibility update:", visibility);
            setIsVisible(visibility);
        };

        socket.on('receiveIFC', handleReceivedIFC);
        socket.on('ifcVisibilityUpdate', handleVisibilityUpdate);

        // Request existing IFC model when joining
        socket.emit('requestIFC');

        return () => {
            socket.off('receiveIFC', handleReceivedIFC);
            socket.off('ifcVisibilityUpdate', handleVisibilityUpdate);
        };
    }, []);

    useEffect(() => {
        if (fileData) {
            loadIFCModel(fileData);
        }
    }, [fileData]);

    // Update model visibility
    useEffect(() => {
        if (model) {
            model.visible = isVisible;
        }
    }, [model, isVisible]);

    return model ? <primitive object={model} /> : null;
}

// The UI component for file selection
export function IfcLoader() {
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
            socket.emit('shareIFC', data);

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
        socket.emit('toggleIfcVisibility', newVisibility);
    };

    return (
        <div style={{ 
            position: 'absolute', 
            bottom: '270px', 
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

export default IfcLoader;

