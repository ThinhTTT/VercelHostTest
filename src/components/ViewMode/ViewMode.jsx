import React, { useEffect } from 'react'
import { useLocalCharacter } from '../../hooks/useStore'
import './style.css'
import { FaUsersViewfinder, FaPerson } from "react-icons/fa6";


export const ViewModeButton = () => {
    const setViewMode = useLocalCharacter((state) => state.setViewMode)
    const viewMode = useLocalCharacter((state) => state.viewMode)

    const onClickHandler = () => {
        console.log("view mode clicked", viewMode);
        setViewMode(!viewMode);
    }

    return (
        <div className="viewmode-button-container">
            <div className="viewmode-button box-shadow-01" onClick={onClickHandler}>
                {viewMode ? <FaUsersViewfinder /> : <FaPerson />}
            </div>
        </div>
    )
};

export default ViewModeButton;