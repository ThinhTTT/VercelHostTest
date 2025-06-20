
 import { ExtrudeGeometry, Shape, BufferGeometry } from 'three';
 import { MeshPhongMaterial } from 'three';
 import { extend } from '@react-three/fiber'

 extend({ ExtrudeGeometry,BufferGeometry,MeshPhongMaterial })

export const RoundedPlane = ({ width = 1, height = 1, radius = 0.2 }) =>{
  const points = [
    [-width / 2, -height / 2 + radius], // Bottom left corner with rounded edge
    [-width / 2, height / 2 - radius], // Top left corner with rounded edge
    [-width / 2 + radius, height / 2], // Top right corner with rounded edge
    [width / 2 - radius, height / 2], // Top left corner with rounded edge
    [width / 2 - radius, -height / 2], // Bottom right corner with rounded edge
    [width / 2, -height / 2 + radius], // Bottom left corner with rounded edge (connect back to starting point)
    ];
  return (
    <mesh>
      <bufferGeometry lines={true} depth={0.1}> 
      <shape points={points} />
      </bufferGeometry>
      <meshPhongMaterial color="lightblue" /> {/* Or use MeshBasicMaterial for textures */}
    </mesh>
  );
}