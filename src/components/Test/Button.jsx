import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { Interactive } from '@react-three/xr'
import { Loader } from '@react-three/drei'

export default function Button({ onClick, color }) {
    const button = useRef()
    const imageButton = useRef()

    const texture = useRef(null)
    const baseColor = new THREE.Color(color);

    function adjustColor(color, factor) {
        return new THREE.Color(color.r * factor, color.g * factor, color.b * factor);
    }
    useEffect(() => {
        if (texture.current) return;
        const loader = new THREE.TextureLoader();
      
        loader.load(
          '/icon/icon-hangup.png',
          (textureLoad) => {
            // This callback runs when the texture is loaded
            texture.current = textureLoad;
            //setTextureLoaded(true); // Set the texture as loaded
            imageButton.current.setupState({
                state:'idle',
                attributes: {
                    //offset: 0.02,
                    backgroundTexture: texture.current,
                }
            })
            imageButton.current.setState('idle')
            
          },
          undefined,
          (error) => {
            console.error('An error occurred while loading the texture', error);
          }
        );
      });

    useEffect(()=>{
        button.current.setupState({
            state: 'hovered',
            attributes: {
                //offset: 0.05,
                backgroundColor: adjustColor(baseColor, 1.5),
                backgroundOpacity: 1,
                fontColor: new THREE.Color(0xffffff)
            }
        })
        button.current.setupState({
            state: 'idle',
            attributes: {
                //offset: 0.035,
                backgroundColor: baseColor,
                backgroundOpacity: 0.3,
                fontColor: new THREE.Color(0xffffff)
            }
        })
        button.current.setupState({
            state: 'selected',
            attributes: {
                //offset: 0.02,
                backgroundColor: adjustColor(baseColor, 0.85),
                fontColor: new THREE.Color(0x222222)
            }
        })
        button.current.setState('idle')
    })

    return (
        <Interactive
            onHover={() => button.current.setState('hovered')}
            onBlur={() => button.current.setState('idle')}
            onSelect={() => onClick()}
        >
            <block
                // onPointerEnter={() => button.current.setState('hovered')}
                // onPointerLeave={() => button.current.setState('idle')}
                // onPointerDown={() => button.current.setState('selected')}
                // onPointerUp={() => {
                //     button.current.setState('hovered')
                //     //onClick()
                // }}
                args={[
                    {
                        width: 0.2,
                        height: 0.2,
                        justifyContent: 'center',
                        borderRadius: 0.1,
                        backgroundColor: new THREE.Color('white'),
                        backgroundOpacity: 1,
                    }
                ]}

            >
                {/* <text content={'Call'} /> */}
                {/* <block
                width={0.05}
                height={0.05}
                backgroundTexture={texture}
                backgroundSize={'contain'}
            /> */}
                <block
                    ref={button}
                    args={[
                        {
                            width: 0.15,
                            height: 0.15,
                            justifyContent: 'center',
                            borderRadius: 0.075
                        }
                    ]}>
                    <block
                    ref={imageButton}
                        args={[
                            {
                                width: 0.1,
                                height: 0.1,
                                backgroundTexture: texture.current,
                                backgroundSize: 'contain',
                            }
                        ]}
                    ></block>
                </block>
            </block>
        </Interactive>
    )
}

