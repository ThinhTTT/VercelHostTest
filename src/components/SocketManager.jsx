import { useEffect} from "react";
import { io } from 'socket.io-client';
import { atom, useAtom } from "jotai";
import {caculateMapData} from "../hooks/useGrid"

export const socket = io.connect();

export const characterAtom = atom([]);
export const messagesAtom = atom([]);
export const mapAtom = atom(null);
export const emojiAtom = atom(-1);
export const animationAtom = atom([]);
export const userAtom = atom();
export const itemsAtom = atom(null);
export const charsTransformAtom = atom();
export const itemDictAtom = atom(null);
export const mapDataAtom = atom(null);
export const mapSizeAtom = atom([0,0]);
export const charsInfoItom = atom([]);
export const isSharingScreenAtom = atom(false);
export const Share = atom(false);

export const videoTextureRefsAtom =  atom([]);

export const SocketManager = () => {
    const [_characters, setCharacters] = useAtom(characterAtom);
    const [_map, setMap] = useAtom(mapAtom);
    const [_messages, setMessages] = useAtom(messagesAtom);
    const [_emoji, setEmoji] = useAtom(emojiAtom);
    const [_user, setUser] = useAtom(userAtom);
    const [_item, setItem] = useAtom(itemsAtom);
    const [_animations, setAnimations] = useAtom(animationAtom);
    const [_charsTransform, setCharsTransform] = useAtom(charsTransformAtom);
    const [_itemDict, setItemDict] = useAtom(itemDictAtom);
    const [_mapData, setMapData] = useAtom(mapDataAtom);
    const [_mapSize, setMapSize] = useAtom(mapSizeAtom);
    const [_charsInfo, setCharsInfo] = useAtom(charsInfoItom);
    const [_videoTextureRefs, setVideoTextureRefs] = useAtom(videoTextureRefsAtom);

    useEffect(() => {
        function onConnect() {
            console.log("Connected");
        }
        function onDisconnect() {
            console.log("Disconnected");
        }

        function onHello(value){
            console.log("onHello", value);
            if (!value || !value.map) {
                console.error("Invalid hello data received:", value);
                return;
            }
            setUser(value.id);
            setMap(value.map);
            setItem(value.map.items || []);
            setItemDict(value.items || {});
            setMapData(caculateMapData(value.map, value.map.items || []));
            //setMapData(value.mapData);
            setMapSize([value.map.size[0] * value.map.gridDivision, value.map.size[1] * value.map.gridDivision]);
        }

        function onCharacter(value){
            setCharacters(value);
        }

        function onMapUpdate(value) {
            console.log("onMapUpdate:",value);
            setMap(value.map);
            setCharacters(value.characters);
            //setMapData(value.map.data);
            //setMapData(value.mapData);
            //setMapSize([value.map.size[0],value.map.size[1]]);
        }
        
        function onMessageReceive(value){
            console.log("onMessageReceive:",value,"|",_messages)
            setMessages(current => [...current,value]);
        }

        function onEmoji(value){
            console.log("onEmoji:",value);
            setEmoji(value);
        }

        function onSyncCharsTransform(value) {
            // console.log("onSyncCharsTransform:",value)
            setCharsTransform(value);
        }
        
        function onSyncCharsAnimation(value) {
            // console.log("onSyncCharsAnimation:",value)
            setAnimations(value);
        }

        function onCharactersInfo(value) {
            setCharsInfo(value);
        }
        
        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("hello", onHello);
        socket.on("characters", onCharacter);
        socket.on("message", onMessageReceive);
        socket.on("mapUpdate", onMapUpdate);
        socket.on("emoji", onEmoji);
        socket.on("syncCharsTransform", onSyncCharsTransform);
        socket.on("syncCharsAnimation", onSyncCharsAnimation);
        socket.on("charsInfo", onCharactersInfo);
        
        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("hello", onHello);
            socket.off("characters", onCharacter);
            socket.off("mapUpdate", onMapUpdate);
            socket.off("message", onMessageReceive);
            socket.off("emoji", onEmoji);
            socket.off("syncCharsTransform", onSyncCharsTransform);
            socket.off("syncCharsAnimation", onSyncCharsAnimation);
            socket.off("charsInfo", onCharactersInfo);
        };
    }, []);
}
