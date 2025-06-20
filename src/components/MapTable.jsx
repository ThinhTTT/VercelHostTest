import { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { SiTruenas } from 'react-icons/si';
import { useThree } from '@react-three/fiber';


// Set Mapbox token globally
mapboxgl.accessToken = 'pk.eyJ1IjoidmZhc29ucGQiLCJhIjoiY2tvbTl3NHFvMHU1YjJ3bzd4cnp0c2h2NSJ9.MXSJRTka-63tR-t8RK-Xag';

export function MapTable({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
  const [map, setMap] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapTexture, setMapTexture] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [buildings, setBuildings] = useState([]);
  const mapContainerRef = useRef(null);
  const meshRef = useRef(null);
  const isDragging = useRef(false);
  const lastPosition = useRef({ x: 0, y: 0 });
  const { camera, raycaster } = useThree();


  // Create a hidden container div for the map
  useEffect(() => {
    const container = document.createElement('div');
    // Base styles
    container.style.position = 'fixed';
    container.style.visibility = 'hidden';
    container.style.transition = 'all 0.3s ease';
    container.style.backgroundColor = '#000';
    
    // Initial size
    container.style.width = '1024px';
    container.style.height = '512px';
    
    document.body.appendChild(container);
    mapContainerRef.current = container;

    // Initialize map
    const mapInstance = new mapboxgl.Map({
      container: container,
      style: 'mapbox://styles/vfasonpd/ckomjiv0e0bka17mzt5z7v5ij',
      center: [139.66461146239243, 35.70698328883841],
      zoom: 15.27,
      pitch: 42,
      bearing: -50,
      interactive: true,
      preserveDrawingBuffer: true,
      minZoom: 15,
      maxZoom: 18
    });

    mapInstance.on('load', () => {
      console.log('Map loaded successfully');
      setupPlateau(mapInstance);
      setMap(mapInstance);
      setMapLoaded(true);
    });

    mapInstance.on('moveend', () => {
    });

    mapInstance.on('error', (e) => {
      console.error('Mapbox error:', e);
    });

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
      if (container.parentNode) {
        document.body.removeChild(container);
      }
    };
  }, []);

  // Create and update texture
  useEffect(() => {
    if (!mapContainerRef.current || !mapLoaded || !map) return;

    try {
      const canvas = mapContainerRef.current.querySelector('canvas');
      if (!canvas) return;

      const texture = new THREE.CanvasTexture(canvas);
      texture.encoding = THREE.sRGBEncoding;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      texture.flipY = true;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      
      setMapTexture(texture);

      const updateTexture = () => {
        texture.needsUpdate = true;
        setMapTexture(prev => {
          if (prev) prev.needsUpdate = true;
          return prev;
        });
      };

      map.on('move', updateTexture);
      map.on('moveend', updateTexture);
      map.on('render', updateTexture);
      map.on('zoom', updateTexture);

      return () => {
        map.off('move', updateTexture);
        map.off('moveend', updateTexture);
        map.off('render', updateTexture);
        map.off('zoom', updateTexture);
        texture.dispose();
      };
    } catch (error) {
      console.error('Error creating texture:', error);
    }
  }, [map, mapLoaded]);

  const handlePointerDown = (e) => {
    e.stopPropagation();
    isDragging.current = true;
    lastPosition.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e) => {
    e.stopPropagation();
    isDragging.current = false;
  };

  const handlePointerMove = (e) => {
    e.stopPropagation();
    if (!isDragging.current || !map) return;

    const deltaX = e.clientX - lastPosition.current.x;
    const deltaY = e.clientY - lastPosition.current.y;
    const sensitivity = 0.8; // Reduced sensitivity for smoother control

    if (e.altKey) {
      // Smoother rotation and tilt
      const rotationSpeed = 0.3;
      const tiltSpeed = 0.3;
      
      map.setBearing(map.getBearing() + deltaX * rotationSpeed);
      const newPitch = Math.max(0, Math.min(75, map.getPitch() + deltaY * tiltSpeed));
      map.setPitch(newPitch);
    } else if (e.shiftKey) {
      // Zoom with shift + drag
      const zoomChange = -deltaY * 0.005;
      map.zoomTo(map.getZoom() + zoomChange, {
        duration: 0
      });
    } else {
      // Smoother panning
      map.panBy([-deltaX * sensitivity, -deltaY * sensitivity], {
        duration: 0
      });
    }

    lastPosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleWheel = (e) => {
    e.stopPropagation();
    if (!map) return;

    if (e.altKey) {
      // Alt + wheel for rotation
      const rotationDelta = e.deltaY * 0.1;
      map.easeTo({
        bearing: map.getBearing() - rotationDelta,
        duration: 0 // Immediate rotation
      });
    } else if (e.shiftKey) {
      // Shift + wheel for tilt
      const currentPitch = map.getPitch();
      const pitchDelta = e.deltaY * 0.1;
      const newPitch = Math.max(0, Math.min(75, currentPitch + pitchDelta));
      map.easeTo({
        pitch: newPitch,
        duration: 0 // Immediate tilt
      });
    } else {
      // Regular wheel for immediate zoom
      const zoomSpeed = 0.01;
      const currentZoom = map.getZoom();
      const zoomDelta = -e.deltaY * zoomSpeed;
      
      // Calculate target zoom with limits
      const targetZoom = Math.max(
        map.getMinZoom(),
        Math.min(map.getMaxZoom(), currentZoom + zoomDelta)
      );

      // Use jumpTo for immediate zoom without animation
      map.jumpTo({
        zoom: targetZoom
      });
    }
  };

  // Add a global wheel event listener to prevent page scrolling
  useEffect(() => {
    const preventScroll = (e) => {
      if (e.target.closest('canvas')) {
        e.preventDefault();
      }
    };

    // Add the event listener with passive: false to allow preventDefault
    window.addEventListener('wheel', preventScroll, { passive: false });

    return () => {
      window.removeEventListener('wheel', preventScroll);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!map || !mapContainerRef.current) return;
    
    const container = mapContainerRef.current;
    const mapCanvas = map.getCanvas();
    const nextFullscreenState = !isFullscreen;
    
    console.log("Toggling fullscreen from", isFullscreen, "to", nextFullscreenState);
    
    // Always remove previous styles first
    container.removeAttribute('style');
    mapCanvas.removeAttribute('style');
    
    // Base styles that are always needed
    Object.assign(container.style, {
      position: 'fixed',
      backgroundColor: '#000',
      margin: '0',
      padding: '0',
      border: 'none',
    });

    if (nextFullscreenState) {
      console.log("Enter fullscreen");
      // Enter fullscreen
      Object.assign(container.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        width: '100vw',
        height: '100vh',
        visibility: 'visible',
        zIndex: '9999',
        overflow: 'hidden',
        display: 'block'
      });

      Object.assign(mapCanvas.style, {
        width: '100vw',
        height: '100vh',
        position: 'absolute',
        top: '0',
        left: '0'
      });
    } else {
      console.log("Exit fullscreen");
      // Exit fullscreen
      Object.assign(container.style, {
        position: 'fixed',
        width: '1024px',
        height: '512px',
        visibility: 'hidden',
        zIndex: '0',
        top: 'auto',
        left: 'auto',
        right: 'auto',
        bottom: 'auto',
        display: 'block'
      });

      Object.assign(mapCanvas.style, {
        width: '1024px',
        height: '512px',
        position: 'absolute',
        top: '0',
        left: '0'
      });
    }

    // Update state and resize immediately
    setIsFullscreen(nextFullscreenState);
    map.resize();
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    toggleFullscreen();
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen]);

  const setupPlateau = (map) => {
    console.log("setupPlateau");
    // add a geojson source with a polygon to be used in the clip layer.
    map.addSource('eraser', {
        'type': 'geojson',
        'data': {
            'type': 'FeatureCollection',
            'features': [
                {
                    'type': 'Feature',
                    'properties': {},
                    'geometry': {
                        'coordinates': [
                            [
                                [139.66434016560476, 35.70734762727297], 
                                [139.66506846307053, 35.707289104885675],
                                [139.66513700246438, 35.70688371493084], 
                                [139.66435569957977, 35.70687233504728], 
                            ]
                        ],
                        'type': 'Polygon'
                    }
                }
            ]
        }
    });

    map.addLayer({
        'id': 'eraser',
        'type': 'clip',
        'source': 'eraser',
        'layout': {
            // specify the layer types to be removed by this clip layer
            'clip-layer-types': ['symbol', 'model'],
            //'clip-layer-scope': ['basemap','bldg']
        }
    });
// add a geojson source which specifies the custom model to be used by the model layer.
    // local:   'http://localhost:5173/BIMLoader/tower.glb'
    // https://localhost:3002/models/building.glb
    var origin = [139.66481146239243, 35.70728328883841];
    map.addSource('model', {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'properties': {
                'modelurl':
                'https://localhost:3002/models/building.glb'
            },
            'geometry': {
                'coordinates': origin,
                'type': 'Point'
            }
        }
    });


    // add the model layer and specify the appropriate `slot` to ensure the symbols are rendered correctly.
    map.addLayer({
        'id': 'tower',
        'type': 'model',
        'slot': 'middle',
        'source': 'model',
        'minzoom': 15,
        'layout': {
            'model-id': ['get', 'modelurl']
        },
        'paint': {
            'model-opacity': 1,
            'model-rotation': [0.0, 0.0, 0.0],
            'model-scale': [1, 1,  1.5],
            'model-color-mix-intensity': 0,
            'model-cast-shadows': true,
            'model-emissive-strength': 0.8,
        }
    });
 }



  return (
    <group position={position} rotation={rotation}>
      {/* Base map */}
      <mesh 
        ref={meshRef}
        position={[0, 1.55, 0]} 
        rotation={[-Math.PI / 4, 0, 0]}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
      >
        <planeGeometry args={[2.2, 1.1]} />
        <meshBasicMaterial 
          map={mapTexture}
          side={THREE.DoubleSide}
          transparent={true}
        />
      </mesh>

      {/* Table leg */}
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[0.3, 1.4, 0.3]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
} 