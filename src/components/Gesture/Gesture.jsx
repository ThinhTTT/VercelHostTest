import React, { useEffect } from 'react'
import { useLocalCharacter } from '../../hooks/useStore'
import './style.css'

const GestureButton = () => {
    
    const setGesture = useLocalCharacter((state) => state.setGesture)
    const gesture = useLocalCharacter((state) => state.gesture)

    useEffect(() => {
        if (gesture) setGesture(null) // reset
      }, [gesture])

    const onClickHandler = () => {
        setGesture("Wave")
    }

    return (
        <div className="gesture-button-container">
            <div className="gesture-button box-shadow-01" onClick={onClickHandler}>
                <img src='icon/hand-waving.png' />
            </div>
        </div>
    )
}

export default GestureButton