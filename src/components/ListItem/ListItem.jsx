import React, { useRef, useState } from 'react'
import './style.css'
import { useAtom, atom } from 'jotai';
import {itemDictAtom} from '../SocketManager';

const TOTAL_EMOJI = 6;
export const itemSelectAtom = atom(null);

export const ListItem = ({setItemSelect}) => {
  const [itemDict] = useAtom(itemDictAtom);

  const [ collapse, setCollapse ] = useState(true);
  const scroll = useRef();

  const onClickToggleHandler = () => {
    setCollapse(!collapse);
  }
  const generateEmoji = () => {
    let list = [];
    for (const [key, value] of Object.entries(itemDict)) {
      list.push(<div key={key} className='select-item' onClick={(e) => {
        e.stopPropagation();
        console.log("this",value.name);
        setItemSelect(value.name);
      }}><img src={`./items/${value.name}.png`}/></div>)
    }
    return list;
  }

	const onWheelHandle = (event) => {
		const scrollAmount = event.deltaY;
		scroll.current.scrollLeft += scrollAmount / 8;
	};

  return (
    <div className='listitem-container'>
      <div className={['listitem-box', collapse ? 'collapse' : 'expand'].join(' ')}>
        <div className='toggle-button' onClick={onClickToggleHandler}>
          { collapse ? <img src='./icon/add-icon.png' /> : <img src='./icon/x-icon.png' />}
        </div>
        <div className='items-scroller' ref={scroll} onWheel={onWheelHandle}>
          { generateEmoji() }
        </div>
      </div>
    </div>
  )
}

export default ListItem