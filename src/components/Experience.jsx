import { Environment, OrbitControls, SoftShadows, useCursor, useTexture, useEnvironment, Lightformer, MeshReflectorMaterial, PerformanceMonitor } from "@react-three/drei";

import { useThree } from "@react-three/fiber";
import { AnimatedMan } from "./AnimatedMan";
import { Item } from "./Item";
import { MapTable } from "./MapTable";
import { useAtom } from "jotai";
import { characterAtom, socket, mapAtom, itemsAtom } from "./SocketManager";
import { useEffect, useState, useRef, Suspense } from 'react';
import { useGrid } from "../hooks/useGrid";
import {
  buildModeAtom,
  draggedItemAtom,
  draggedItemRotationAtom,
  deleteItemAtom
} from "./EditRoom";
import * as THREE from "three";
import { useXR, useController } from "@react-three/xr";
import { useFrame } from "@react-three/fiber";


export const Experience = () => {

  const [buildMode] = useAtom(buildModeAtom);
  const [map] = useAtom(mapAtom);
  const [items, setItems] = useAtom(itemsAtom);
  const [draggedItem, setDraggedItem] = useAtom(draggedItemAtom);
  const [draggedItemRotation, setDraggedItemRotation] = useAtom(
    draggedItemRotationAtom
  );
  const [draggedItemPosition, setDraggedItemPosition] = useState([0, 0]);
  const [deleteItem, setDeleteItem] = useAtom(deleteItemAtom);
  const [canDrop, setCanDrop] = useState(false);
  const [characters] = useAtom(characterAtom);
  const [onFloor, SetOnFloor] = useState(false);
  useCursor(onFloor.current);
  //console.log("item", items);
  const _floorNormal = useTexture('./textures/floor/Tiles_033_normal.jpg');
  const _floorAo = useTexture('./textures/floor/Tiles_033_ambientOcclusion.jpg');
  const _floorRoughness = useTexture('./textures/floor/Tiles_033_roughness.jpg');
  const _floorMap = useTexture('./textures/floor/floor.jpg');

  const tillingScale = null;

  const customEnvMap = useEnvironment({ files: './textures/neutral.hdr' });

  const { vector3ToGrid, gridToVector3, caculateMapData } = useGrid();

  const scene = useThree((state) => state.scene);
  const player = useXR((state) => state.player);
  const isPresenting = useXR((state) => state.isPresenting);
  const { camera } = useThree();
  const leftController = useController("left");
  const rightController = useController("right");

  useEffect(() => {
    if (player) {
      // Update the camera's position based on the player's position
      camera.position.copy(player.position);
    }
  }, [player, camera]);
  // const player = null
  // const isPresenting = false
  //init right value
  useEffect(() => {
    setDraggedItem(null);
  }, []);

  const onPlaneClicked = (e) => {
    if (!buildMode) {
      const character = scene.getObjectByName(`character-${socket.id}`);
      //console.log("character", character);
      if (!character) {
        return;
      }
    } else {
      if (draggedItem !== null) {
        if (canDrop) {
          setItems((prev) => {
            const newItems = [...prev];
            newItems[draggedItem].gridPosition = vector3ToGrid(e.point);
            newItems[draggedItem].rotation = draggedItemRotation;
            return newItems;
          });
        }
        setDraggedItem(null);
      }
    }
  };

  const tillingTexture = (texture, size) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    if (size) {
      texture.repeat.set(size[0], size[1]);
    }
    else {
      texture.repeat.set(map.size[0] / map.size[1], 1)
    }

    return texture;
  }

  //console.log("draggedItemPosition", draggedItemPosition);
  //console.log("draggedItem", draggedItem);

  useEffect(() => {
    if (draggedItem === null) {
      return;
    }
    console.log("draggedItem", draggedItem);
    const item = items[draggedItem];
    if (item === null) return;
    console.log("item pick", item);
    const width = draggedItemRotation === 1 || draggedItemRotation === 3 ? item.size[1] : item.size[0];
    const height = draggedItemRotation === 1 || draggedItemRotation === 3 ? item.size[0] : item.size[1];
    let droppable = true;

    if (
      draggedItemPosition[0] < 0 ||
      draggedItemPosition[0] + width > map.size[0] * map.gridDivision
    ) {
      droppable = false;
    }
    if (
      draggedItemPosition[1] < 0 ||
      draggedItemPosition[1] + height > map.size[1] * map.gridDivision
    ) {
      droppable = false;
    }

    if (!item.walkable && !item.wall) {
      console.log("---items: " , items);
      items.forEach((otherItem, idx) => {
        // ignore self
        if (idx === draggedItem) {
          return;
        }

        // ignore wall & floor
        if (otherItem.walkable || otherItem.wall) {
          return;
        }

        // check item overlap
        const otherWidth =
          otherItem.rotation === 1 || otherItem.rotation === 3
            ? otherItem.size[1]
            : otherItem.size[0];
        const otherHeight =
          otherItem.rotation === 1 || otherItem.rotation === 3
            ? otherItem.size[0]
            : otherItem.size[1];
        if (
          draggedItemPosition[0] < otherItem.gridPosition[0] + otherWidth &&
          draggedItemPosition[0] + width > otherItem.gridPosition[0] &&
          draggedItemPosition[1] < otherItem.gridPosition[1] + otherHeight &&
          draggedItemPosition[1] + height > otherItem.gridPosition[1]
        ) {
          droppable = false;
        }
      });
    }

    setCanDrop(droppable);
  }, [draggedItem, draggedItemPosition, items, draggedItemRotation]);

  const controls = useRef();
  const state = useThree((state) => state);

  useEffect(() => {
    if (buildMode) {
      console.log("---map.items: " , map.items);
      setItems(map.items);
      state.camera.position.set(8, 8, 8);
      controls.current.target.set(0, 0, 0);
    } else {
      console.log("----" , items);
      const data = caculateMapData(items);
      console.log("data", data.length, data);
      socket.emit("itemsUpdate", { items, data });
    }
  }, [buildMode]);

  //cant use useEffect to update data because it will be called infinitely

  useEffect(() => {
    if (deleteItem !== null) {
      setItems((prev) => {
        const newItems = [...prev];
        newItems.splice(deleteItem, 1);
        return newItems;
      });
      setDeleteItem(null);
      setDraggedItem(null);
    }
  }, [deleteItem]);

  const [shadowSamples, setShadowSamples] = useState(10)

  const wallColor = "white";
  const spotlightRef = useRef();

  // Auto rotate spotlight
  useFrame((state, delta) => {
    if (spotlightRef.current) {
      spotlightRef.current.angle -= delta * 0.5; // Rotation speed
    }
  });

  return (
    <>
      {/* <Environment preset="sunset" blur={0.01} /> */}
      <ambientLight intensity={1} />
      <PerformanceMonitor onIncline={() => setShadowSamples(20)} onDecline={() => setShadowSamples(5)} />

      {/* <SoftShadows samples={shadowSamples} focus={2} size={30} /> */}
      {/* <ambientLight
        // position={[0, 0, 0]}
        //target={new THREE.Vector3(map.size[0] / 2, 0, map.size[1] / 2)}
        //position={[-4,4,-4]}
        intensity={1}
        castShadow
        // shadow-mapSize={[1024, 1024]}
        // shadow-camera-near={0.1}
        // shadow-camera-far={20}
        // shadow-camera-left={25}
        // shadow-camera-right={25}
        // shadow-camera-top={10}
        // shadow-camera-bottom={-5}
      >
      </ambientLight> */}
      <mesh position={[2, 2, 2]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshBasicMaterial color="red" roughness={1} metalness={0.8}/>
      </mesh>
      <spotLight
        ref={spotlightRef}
        position={[2, 2, 2]}
        intensity={1}
        castShadow
      />
      {buildMode && (
        <OrbitControls
          ref={controls}
          minDistance={5}
          maxDistance={40}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
          screenSpacePanning={false}
          target={new THREE.Vector3(map.size[0] / 2, 0, map.size[1] / 2)}
        />
      )}wd

      <Suspense>
        {
          (buildMode ? items : map.items).map((item, idx) => (
            <Item
              key={`${item.name}-${idx}`}
              item={item}
              onClick={() => {
                if (buildMode) {
                  setDraggedItem((prev) => (prev === null ? idx : prev));
                  setDraggedItemRotation(item.rotation || 0);
                  console.log("item", item, idx);
                }
              }}
              isDragging={draggedItem === idx}
              draggedItemPosition={draggedItemPosition}
              dragRotation={draggedItemRotation}
              canDrop={canDrop}
            />
          ))
        }
        <mesh position={[13, 0, 10]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="red" roughness={1} metalness={0.8}/>
        </mesh>
        {/* FLOOR */}
        <mesh
          rotation-x={-Math.PI / 2}
          position-y={0}
          onClick={onPlaneClicked}
          onPointerEnter={() => SetOnFloor(true)}
          onPointerLeave={() => SetOnFloor(false)}
          onPointerMove={(e) => {
            if (!buildMode) return;
            if (onFloor) {
              const gridPosition = vector3ToGrid(e.point);
              setDraggedItemPosition(gridPosition);
            }
          }}
          position-x={map.size[0] / 2}
          position-z={map.size[1] / 2}
          receiveShadow
          envMapIntensity={0.3}
        >
          <planeGeometry args={map.size} />
          {/* <MeshReflectorMaterial
            envMapIntensity={0}
            lightMapIntensity={0.95 + 1}
            lightMap={tillingTexture(_floorAo, tillingScale)}
            mirror={0}
            blur={[128, 128]}
            resolution={512}
            mixBlur={0.3}
            mixStrength={1}
            roughness={0.01}
            color="#e7f5ff"
            metalness={0}
            map={tillingTexture(_floorMap, tillingScale)}
            aoMap={tillingTexture(_floorAo, tillingScale)}
            normalMap={tillingTexture(_floorNormal, tillingScale)} dww
          /> */}
          <meshStandardMaterial
          color={wallColor}
          // side={THREE.DoubleSide}
          // envMapIntensity={0.3}
          // receiveShadow
          // map={tillingTexture(_floorMap, tillingScale)}
          // aoMap={tillingTexture(_floorAo, tillingScale)}
          // normalMap={tillingTexture(_floorNormal, tillingScale)}
          />
        </mesh>
        {/* CELL */}
        {
          !buildMode && (
            <mesh
              rotation-x={-Math.PI / 2}
              position-y={4.001}
              position-x={map.size[0] / 2}
              position-z={map.size[1] / 2}
              castShadow
              receiveShadow
            >
              <planeGeometry args={map.size} />
              <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} envMapIntensity={0.3}/>
            </mesh>
          )
        }
        {/* {
          !buildMode && (
            <mesh
              rotation-x={-Math.PI / 2}
              position-y={4.001}
              position-x={0}
              position-z={map.size[1] / 2}
              castShadow
              receiveShadow
            >
              <planeGeometry args={[map.size[0] * 1.7, map.size[1]]} />
              <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} envMapIntensity={0.3}
              />
            </mesh>
          )
        }
        {
          !buildMode && (
            <mesh
              rotation-x={-Math.PI / 2}
              position-y={4.001}
              position-x={map.size[0]}
              position-z={map.size[1] * (1 - 0.325)}
              castShadow
              receiveShadow
            >
              <planeGeometry args={[map.size[0], map.size[1] * 0.65]} />
              <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} envMapIntensity={0.3} />
            </mesh>
          )
        } */}
        {/* RIGHT WALL */}
        {
          !buildMode && (
            <mesh
              rotation-y={-Math.PI / 2}
              position-x={map.size[0]}
              position-y={8 / 2}
              position-z={map.size[1] / 2}
              castShadow
              receiveShadow
            >
              <planeGeometry args={[map.size[1], 8]} />
              <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} envMapIntensity={0.3} />
            </mesh>
          )
        }
        {/* LEFT WALL */}
        {
          !buildMode && (
            <mesh
              rotation-y={-Math.PI / 2}
              position-x={0}
              position-y={8 / 2}
              position-z={map.size[1] / 2}
              castShadow
              receiveShadow
            >
              <planeGeometry args={[map.size[1], 8]} />
              <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} envMapIntensity={0.3} />
            </mesh>
          )
        }
        {/* BACK WALL */}
        {
          !buildMode && (
            <mesh
              rotation-z={-Math.PI / 2}
              position-x={map.size[0] / 2}
              position-y={8 / 2}
              position-z={0}
              castShadow
              receiveShadow
            >
              <planeGeometry args={[8, map.size[0] + 0.1]} />
              <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} envMapIntensity={0.3} />
            </mesh>
          )
        }
        {
          !buildMode && characters.map((character) => (
            <AnimatedMan
              key={character.id}
              idChar={character.id}
              type={character.type}
              color={character.color.color}
              headColor={character.color.headColor}
              vrPlayer={player}
              isXR={isPresenting}
              rightController={(socket.id === character.id) ? rightController : null} 
              leftController={(socket.id === character.id) ? leftController : null}
            //camera={camera}
            />
          ))
        }
      </Suspense>
      <MapTable position={[9, 0, 10]} rotation={[0, 0, 0]} />
      
    </>
  );
};

export default function () {
  return (
    <>
          <Experience/>
    </>
  )
}
