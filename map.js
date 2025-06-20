import items from './items.js';

export const map = {
    size: [20, 20],
    gridDivision: 2,
    data: [],
    items: [
      {
        ...items.tv,
        gridPosition: [23, 0],
        rotation: 0
      },
      {
        ...items.VFATree,
        gridPosition: [16, 16],
        rotation: 0
      },
      {
        ...items.udlTableChair,
        gridPosition: [2, 0],
        rotation: 1
      },
      {
        ...items.udlTableChair,
        gridPosition: [2, 4],
        rotation: 1
      },
      {
        ...items.udlTableChair,
        gridPosition: [2, 8],
        rotation: 1
      },
      {
        ...items.udlTableChair,
        gridPosition: [10, 0],
        rotation: 1
      },
      {
        ...items.udlTableChair,
        gridPosition: [10, 4],
        rotation: 1
      },
      {
        ...items.udlTableChair,
        gridPosition: [10, 8],
        rotation: 1
      },
      {
        ...items.udlTableChair,
        gridPosition: [18, 0],
        rotation: 1
      },
      {
        ...items.udlTableChair,
        gridPosition: [18, 4],
        rotation: 1
      },
      {
        ...items.udlTableChair,
        gridPosition: [18, 8],
        rotation: 1
      },
      {
        ...items.udlTableBar,
        gridPosition: [2, 16],
        rotation: 2
      },
      {
        ...items.udlLogo,
        gridPosition: [14, 0],
        rotation: 0
      },
      {
        ...items.udlWaterCooler,
        gridPosition: [14, 16],
        rotation: 2
      },
      {
        ...items.udlTableChair,
        size: [4, 4],
        gridPosition: [26, 0],
        
        rotation: 1
      },
      {
        ...items.udlTableChair,
        size: [4, 4],
        gridPosition: [26, 4],
        
        rotation: 1
      },
      {
        ...items.udlTableChair,
        size: [4, 4],
        gridPosition: [26, 8],
        
        rotation: 1
      },
      {
        name: 'udlStaircase',
        size: [5, 6],
        gridPosition: [31, 0],
        
        rotation: 2
      },
      {
        name: 'udlStairs',
        size: [2, 6],
        gridPosition: [27, 15],
        
        rotation: 1
      },
      {
        name: 'udlBlind',
        size: [4, 1],
        wall: true,
        gridPosition: [0, 17],
        
        rotation: 0
      },
      {
        name: 'udlBlind',
        size: [4, 1],
        wall: true,
        gridPosition: [4, 17],
        
        rotation: 0
      },
      {
        name: 'udlBlind',
        size: [4, 1],
        wall: true,
        gridPosition: [8, 17],
        
        rotation: 0
      },
      {
        name: 'udlBlind',
        size: [4, 1],
        wall: true,
        gridPosition: [12, 17],
        
        rotation: 0
      },
      {
        name: 'udlBlind',
        size: [4, 1],
        wall: true,
        gridPosition: [16, 17],
        
        rotation: 0
      },
      {
        name: 'udlBlind',
        size: [4, 1],
        wall: true,
        gridPosition: [32, 17],
        
        rotation: 0
      },
      {
        name: 'udlBlind',
        size: [4, 1],
        wall: true,
        gridPosition: [24, 17],
        
        rotation: 0
      },
      {
        name: 'udlBlind',
        size: [4, 1],
        wall: true,
        gridPosition: [20, 17],
        
        rotation: 0
      }
    ],
  };

  export const meetingMap = {
    size: [20, 20],
    gridDivision: 2,
    data: [],
    items: [
      {
        name: 'udlLogo',
        size: [ 2, 1 ],
        wall: true,
        walkable: true,
        gridPosition: [ 23, 6 ],
        tmp: true,
        rotation: 3
      },
      {
        name: 'udlTableChair',
        size: [ 4, 4 ],
        walkable: true,
        gridPosition: [ 4, 5 ],
        tmp: true,
        rotation: 0
      },
      {
        name: 'udlTableChair',
        size: [ 4, 4 ],
        walkable: true,
        gridPosition: [ 8, 5 ],
        tmp: true,
        rotation: 0
      },
      {
        name: 'udlTableChair',
        size: [ 4, 4 ],
        walkable: true,
        gridPosition: [ 12, 5 ],
        tmp: true,
        rotation: 0
      },
      {
        name: 'udlTableChair',
        size: [ 4, 4 ],
        walkable: true,
        gridPosition: [ 16, 5 ],
        tmp: true,
        rotation: 0
      },
      {
        name: 'tv',
        size: [ 2, 1 ],
        walkable: true,
        gridPosition: [ 0, 6 ],
        tmp: true,
        rotation: 1
      },
      {
        name: 'VFATree',
        size: [ 1, 1 ],
        walkable: false,
        gridPosition: [ 23, 1 ],
        tmp: true,
        rotation: 0
      },
      {
        name: 'VFATree',
        size: [ 1, 1 ],
        walkable: false,
        gridPosition: [ 23, 12 ],
        tmp: true,
        rotation: 0
      },
      {
        name: 'VFATree',
        size: [ 1, 1 ],
        walkable: false,
        gridPosition: [ 0, 3 ],
        tmp: true,
        rotation: 0
      },
      {
        name: 'VFATree',
        size: [ 1, 1 ],
        walkable: false,
        gridPosition: [ 0, 10 ],
        tmp: true,
        rotation: 0
      },
      {
        name: 'VFATree',
        size: [ 1, 1 ],
        walkable: false,
        gridPosition: [ 14, 12 ],
        tmp: true,
        rotation: 0
      },
      {
        name: 'udlWaterCooler',
        size: [ 1, 1 ],
        walkable: false,
        gridPosition: [ 13, 12 ],
        tmp: true,
        rotation: 2
      },
      {
        name: 'udlBlind',
        size: [ 4, 1 ],
        wall: true,
        walkable: false,
        gridPosition: [ 0, 13 ],
        tmp: true,
        rotation: 0
      },
      {
        name: 'udlBlind',
        size: [ 4, 1 ],
        wall: true,
        walkable: false,
        gridPosition: [ 4, 13 ],
        tmp: true,
        rotation: 0
      },
      {
        name: 'udlBlind',
        size: [ 4, 1 ],
        wall: true,
        walkable: false,
        gridPosition: [ 8, 13 ],
        tmp: true,
        rotation: 0
      },
      {
        name: 'udlBlind',
        size: [ 4, 1 ],
        wall: true,
        walkable: false,
        gridPosition: [ 12, 13 ],
        tmp: true,
        rotation: 0
      },
      {
        name: 'udlBlind',
        size: [ 4, 1 ],
        wall: true,
        walkable: false,
        gridPosition: [ 16, 13 ],
        tmp: true,
        rotation: 0
      },
      {
        name: 'udlBlind',
        size: [ 4, 1 ],
        wall: true,
        walkable: false,
        gridPosition: [ 20, 13 ],
        tmp: true,
        rotation: 0
      },
    ],
  };

  export default {
    map,
    meetingMap,
  };