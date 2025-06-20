import React, { useRef, useState } from 'react'
import './style.css'
import { socket } from "../SocketManager";

const TOTAL_EMOJI = 30;
const Emotion = () => {

  const [ collapse, setCollapse ] = useState(true);
  const scroll = useRef();
  
  const onClickSelectEmoji = (emojiId) => {
    console.log("onClickSelectEmoji",emojiId);
    socket.emit("emoji",{id:socket.id, emojiId:emojiId})
  }

  const onClickToggleHandler = () => {
    setCollapse(!collapse);
  }
  const generateEmoji = () => {
    let list = []
    for (let i = 1; i <= TOTAL_EMOJI; i++)
      list.push(<div key={i} className='emoji-item' onClick={() => onClickSelectEmoji(i)}><img src={`./emoji/emoji-${(i<10?'0':'')}${i}.png`}/></div>)
    return list
  }

	const onWheelHandle = (event) => {
		const scrollAmount = event.deltaY;
		scroll.current.scrollLeft += scrollAmount / 8;
	};

  return (
    <div className='emotion-container'>
      <div className={['emotion-box', 'box-shadow-01', collapse ? 'collapse' : 'expand'].join(' ')}>
        <div className='toggle-button' onClick={onClickToggleHandler}>
          { collapse ? <img src='./icon/emoji-icon.png' /> : <img src='./icon/x-icon.png' />}
        </div>
        <div className='emoji-scroller' ref={scroll} onWheel={onWheelHandle}>
          { generateEmoji() }
        </div>
      </div>
    </div>
  )
}

export default Emotion