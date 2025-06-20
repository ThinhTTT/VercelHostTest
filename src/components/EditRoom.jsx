import React, { useEffect, useState } from 'react'
import { atom, useAtom } from "jotai";
import ListItem from './ListItem/ListItem.jsx';
import {itemsAtom, itemDictAtom} from "./SocketManager";
import './style.css'
import { IoTrashBinOutline } from "react-icons/io5";
import { AiOutlineRotateRight } from "react-icons/ai";
import { FcCancel } from "react-icons/fc";

export const buildModeAtom = atom(false);
export const draggedItemAtom = atom(null);
export const draggedItemRotationAtom = atom(0);
export const deleteItemAtom = atom(null);

export const EditRoomButton = () => {
    const [items, setItems] = useAtom(itemsAtom);
    const [itemDict] = useAtom(itemDictAtom);
    const [buildMode, setBuildMode] = useAtom(buildModeAtom);
    const [draggedItem, setDraggedItem] = useAtom(draggedItemAtom);
    const [draggedItemRotation, setDraggedItemRotation] = useAtom(draggedItemRotationAtom);
    const [_, setDeleteItem] = useAtom(deleteItemAtom);

    const onClickEditHandler = () => {
        if (buildMode){
            setDraggedItem(null);
            setDeleteItem(null);
        }

        setBuildMode(!buildMode);
    }

    const onItemSelected = (item) => {
        if (item === null) return;
        //setSelectMode(false);
    
        setItems((prev) => [
          ...prev,
          {
            ...itemDict[item],
            gridPosition: [0, 0],
            tmp: true,
          },
        ]);
        console.log("onEditItem",items.length);
        setDraggedItem(items.length);
        setDraggedItemRotation(0);
      };

    useEffect(() => {
        if (buildMode) {
            setDraggedItem(null);
            setDeleteItem(null);
        }
    }, [buildMode])

    return (
        <>
            <div className="editroom-button-container">
                {/* SWITCH EDIT MODE */}
                <div className="fixed-box circle-button toggle-edit" onClick={onClickEditHandler}>
                    {buildMode ? <img src='icon/x-icon.png' /> : <img src='icon/edit-icon.png' />}
                </div>
                {/* ADD */}
                {/* {buildMode && !_selectedMode && (
                <div className="custom-button add" onClick={() => setSelectMode(true)}>
                    {<img src='icon/add-icon.png' />}
                </div>
            )} */}
                
                {/* DELETE */}
                {buildMode && (draggedItem !== null) && (
                    <div className="fixed-box circle-button delete" onClick={() => setDeleteItem(draggedItem)}>
                        <IoTrashBinOutline />
                    </div>
                )}
                {/* ROTATE */}
                {buildMode && (draggedItem !== null) && (
                    <div className="fixed-box circle-button rotate"
                        onClick={() =>
                            setDraggedItemRotation(
                                draggedItemRotation === 3 ? 0 : draggedItemRotation + 1
                            )
                        }
                    >
                        <AiOutlineRotateRight />
                    </div>
                )}
                {/* CANCEL */}
                {buildMode && (draggedItem !== null) && (
                    <div className="fixed-box circle-button cancel" onClick={() => setDraggedItem(null)}>
                        <FcCancel />
                    </div>
                )}
            </div>
            {buildMode && (
                    <ListItem setItemSelect={onItemSelected}/>
                )}
        </>
    )
}

export default EditRoomButton