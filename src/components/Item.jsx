import { useCursor, useGLTF } from "@react-three/drei";
import { useAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { SkeletonUtils } from "three-stdlib";
import { useGrid } from "../hooks/useGrid";
import { mapAtom,isSharingScreenAtom } from "./SocketManager";
import { buildModeAtom } from "./EditRoom";
import * as THREE from 'three';

export const Item = ({
    item,
    onClick,
    isDragging,
    draggedItemPosition,
    canDrop,
    dragRotation,
  }) => {
    const { name, gridPosition, size, rotation: itemRotation } = item;
    const rotation = isDragging ? dragRotation : itemRotation;
    const { gridToVector3 } = useGrid();
    const [map] = useAtom(mapAtom);
    const { scene } = useGLTF(`/models/items/${name}.glb`);
    // Skinned meshes cannot be re-used in threejs without cloning them
    const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
    const width = rotation === 1 || rotation === 3 ? size[1] : size[0];
    const height = rotation === 1 || rotation === 3 ? size[0] : size[1];
    const [hover, setHover] = useState(false);
    const [buildMode] = useAtom(buildModeAtom);
    const [videoTexture, setVideoTexture] = useState(null);
    const [isSharingScreen, SetIsSharingScreen] = useAtom(isSharingScreenAtom);
    useCursor(buildMode ? hover : undefined);

    useEffect(() => {
      clone.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.material.envMapIntensity = 0.3;
        }
      });
    }, []);

    useEffect(() => {
      if(name === "tv"){
      const find = String("share-screen");
      let videoElement = document.getElementById(find);

      if(videoElement){
        let newTex = new THREE.VideoTexture(videoElement);
        newTex.format= THREE.RGBAFormat;
        newTex.colorSpace = "srgb"
        newTex.flipY= false;
        setVideoTexture(newTex);
      }else{
        setVideoTexture((a)=>a=null);
      }
    }
  }, [isSharingScreen]);

    useEffect(() => {
      if(videoTexture&&name == "tv"){
        const videoMaterial = new THREE.MeshBasicMaterial({
          map: videoTexture,
          reflectivity:0,
          lightMap:null,
          fog:false,
          envMap:null,
          toneMapped:false,
          needsUpdate:true,
        });
        clone.traverse((child) => {
          if (child.isMesh) {
            if(child.name === "tv"){
              child.material = videoMaterial;
              child.material.needsUpdate =true;
            }
          }
        });
      }else{
      }
  }, [videoTexture]);
    
    return (
    <group
    onClick={onClick}
    position={gridToVector3(
      isDragging ? draggedItemPosition || gridPosition : gridPosition,
      width,
      height
    )}
    onPointerEnter={() => setHover(true)}
    onPointerLeave={() => setHover(false)}
    >
        <primitive object={clone}  rotation-y={((rotation || 0) * Math.PI) / 2}/>
        {isDragging && (
        <mesh>
          <boxGeometry
            args={[width / map.gridDivision, 0.2, height / map.gridDivision]}
          />
          <meshBasicMaterial
            color={canDrop ? "green" : "red"}
            opacity={0.3}
            transparent
          />
        </mesh>
      )}
    </group>
    );
  };
