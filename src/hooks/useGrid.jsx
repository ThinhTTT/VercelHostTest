import { useAtom } from "jotai";
import { mapAtom } from "../components/SocketManager";

import * as THREE from "three";

export const useGrid = () => {
  const [map] = useAtom(mapAtom);

  const vector3ToGrid = (vector3) => {
    return [
      Math.floor(vector3.x * map.gridDivision),
      Math.floor(vector3.z * map.gridDivision),
    ];
  };

  const gridToVector3 = (gridPosition, width = 1, height = 1) => {
    return new THREE.Vector3(
      width / map.gridDivision / 2 + gridPosition[0] / map.gridDivision,
      0,
      height / map.gridDivision / 2 + gridPosition[1] / map.gridDivision
    );
  };
  
  const isInside = (vec) => {
    const allocate = vector3ToGrid(vec);
    if (allocate[0] < 0 || allocate[0] >= map.size[0] * map.gridDivision) return false;
    if (allocate[1] < 0 || allocate[1] >= map.size[1] * map.gridDivision) return false;
    return true;
  }

  const isWalkAble = (vec) => {
    const allocate = vector3ToGrid(vec);
    if (allocate[0] < 0 || allocate[0] >= map.size[0] * map.gridDivision) return false;
    if (allocate[1] < 0 || allocate[1] >= map.size[1] * map.gridDivision) return false;
    return map.data[allocate[0]+allocate[1] * map.size[0] * map.gridDivision];
  }

  const caculateMapData = (items) => {
 
    const mapData = new Array(map.size[0] * map.size[1] * map.gridDivision * map.gridDivision).fill(true);
    items.forEach((item) => {
      if(!item.walkable){
       
      //console.log("item", item.name);
      const { gridPosition, size , rotation} = item;
      const [x, y] = gridPosition;
    const [w, h] =  rotation === 0 || rotation === 2 ? [size[0],size[1]] : [size[1],size[0] ]; 
      for (let i = 0; i < w; i++) {
        for (let j = 0; j < h; j++) {
          let index = (y + j) * map.size[0] * map.gridDivision + (x + i);
          if (index >= mapData.length) {
            continue;
          }
          mapData[index] = false;
        }
      }
    }
    })
    return mapData;
  }

  return {
    vector3ToGrid,
    gridToVector3,
    isWalkAble,
    caculateMapData,
    isInside
  };
};

 export const caculateMapData = (map,items) => {
    const mapData = new Array(map.size[0] * map.size[1] * map.gridDivision * map.gridDivision).fill(true);
    items.forEach((item) => {
      if(!item.walkable){
       
      //console.log("item", item.name);
      const { gridPosition, size , rotation} = item;
      const [x, y] = gridPosition;
       const [w, h] =  rotation === 0 || rotation === 2 ? [size[0],size[1]] : [size[1],size[0] ]; 
      
        
      for (let i = 0; i < w; i++) {
        for (let j = 0; j < h; j++) {
          let index = (y + j) * map.size[0] * map.gridDivision + (x + i);
          if (index >= mapData.length) {
            continue;
          }
          mapData[index] = false;
        }
      }
    }
    })
    return mapData;
  }