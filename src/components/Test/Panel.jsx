import { useState, useRef } from 'react'
import ThreeMeshUI from 'three-mesh-ui'
import Button from './Button'
import { extend, useFrame } from "@react-three/fiber";
import * as THREE from 'three'
import Meeting from '../Meeting/Meeting';
import { Html } from '@react-three/drei';
import { Font } from 'three-stdlib';
import { useLocalCharacter } from '../../hooks/useStore';
import {useXR} from '@react-three/xr'


extend(ThreeMeshUI)

function Title({ accentColor }) {
  return (
    <block
      args={[
        {
          width: 1,
          height: 0.25,
          backgroundOpacity: 0,
          justifyContent: 'center'
        }
      ]}>
      <text content={'Hello '} />
      <text content={'world!'} />
    </block>
  )
}

function Panel() {
  const boxRef = useRef()
  const button = useRef()
  const [accentColor] = useState(() => new THREE.Color('red'))
  const inMeeting = useLocalCharacter((state) => state.inMeeting)
  const setInMeeting = useLocalCharacter((state) => state.setInMeeting)
  const isPresenting = useXR((state) => state.isPresenting);
  useFrame(() => {
    ThreeMeshUI.update()
  })
  return (
    isPresenting &&
    <block
      ref={boxRef}
      position={[1, 1, 3.5]}
      rotation-y={Math.PI / 2}
      rotation-x={inMeeting ? 0 : 3 * Math.PI / 4}
      args={[
        {
          width: 1,
          height: 1,
          fontSize: 0.1,
          backgroundOpacity: 0,

        }
      ]}>
      {/* <Title accentColor={accentColor} /> */}
      <Button
      ref = {button}
      onClick={() => setInMeeting(!inMeeting)}
      color={inMeeting ?  'red' : 'aqua'}
      />
      {/* {inMeeting &&  <Button onClick={() => setInMeeting(!inMeeting)} />} */}

    </block>
  )
}
export default Panel