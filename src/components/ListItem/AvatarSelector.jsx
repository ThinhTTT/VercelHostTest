import { useGLTF, useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useAtom } from "jotai";
import { useMemo, useRef } from "react";
import { SkeletonUtils } from "three-stdlib";
import { AnimatedMan } from "../AnimatedMan";

const ShopItem = ({ item, ...props }) => {

    // Skinned meshes cannot be re-used in threejs without cloning them
    //const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);

    return (
        <AnimatedMan
            key={"test"}
            idChar={"test"}
        />
    );
};

export const AvatarSelector = ({ onItemSelected }) => {

    const maxX = useRef(0);
    const items = [{item: "AnimatedMan", index:0},{item: "AnimatedMan", index:1}
    ,{item: "AnimatedMan", index:2},{item: "AnimatedMan", index:3},{item: "AnimatedMan", index:4},{item: "AnimatedMan", index:5}]
    const shopItems = useMemo(() => {
        let x = 0;
        //items = [{item: "AnimatedMan", index:"0"}]
        return Object.values(items).map((item, index) => {
            maxX.current = index;
            return (
                // <ShopItem
                //     key={item}
                //     position={[0, 0, index]}
                //     item={item}
                //     onClick={(e) => {
                //         e.stopPropagation(); // Prevents the onPlaneClicked from firing just after we pick up an item
                //         onItemSelected(item);
                //     }}
                // />
                <mesh position-x={index*2}>
                    <boxGeometry/>
                    <meshStandardMaterial attach="material" color="hotpink" />
                </mesh>
            );
        });
    }, [items]);

    const shopContainer = useRef();
    const scrollData = useScroll();
    useFrame(() => {
            shopContainer.current.position.x = -scrollData.offset * maxX.current;
            console.log("scrollData",scrollData.offset);
        //shopContainer.current.position.x = -scrollData.offset * maxX.current;
    });
    return <group ref={shopContainer}>{shopItems}</group>;
};

export default AvatarSelector;