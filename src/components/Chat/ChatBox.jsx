import { useEffect, useRef, useState } from "react";
import { socket, messagesAtom, charsInfoItom } from "../SocketManager";
import { useAtom, atom, useSetAtom } from "jotai";
import './style.css'
import { useLocalCharacter } from "../../hooks/useStore";

const ChatBox = () => {
	const [hide, setHide] = useState(false);
	const [messages] = useAtom(messagesAtom);
	const [infos] = useAtom(charsInfoItom);
	const refInput = useRef()
	const refMessagesContainer = useRef()

	const setIsChatActive = useLocalCharacter((state) => state.setIsChatActive)
	const isChatActive = useLocalCharacter((state) => state.isChatActive)

	const sendMessage = (msg) => {
		if (msg.length == 0) return;
		console.log("send message: ", msg);
		socket.emit("message", { id: socket.id, content: msg })
		refInput.current.value = '';
	}

	const onSubmitSendHandler = (e) => {
		e.preventDefault();
		const msg = e.target[0].value;
		sendMessage(msg)
	}
	const onClickSendHandler = () => {
		const msg = refInput.current.value;
		sendMessage(msg)
	}

	const onClickHideChatHandler = () => {
		setHide(pre => !pre)
	}

	useEffect(() => {
		setHide(true)
	}, [])

	useEffect(() => {
		refMessagesContainer.current.scrollTop = refMessagesContainer.current.scrollHeight;
	}, [messages])

	return (
		<>
			<div className="outer-container">
				<div className={["chatbox", "fixed-box", "box-shadow-01", hide ? "hide" : "show"].join(' ')}>
					<div className="title" onClick={onClickHideChatHandler}>Chat<div className="close-button" onClick={onClickHideChatHandler}>{hide ? '+' : '-'}</div></div>
					<div className="message-container" ref={refMessagesContainer}>
						{messages.length > 0
							? messages.map(m => (<Message key={messages.indexOf(m)} isMine={socket.id == m.id} name={infos.find(i => i.id === m.id)?.name ?? 'the one who left'} content={m.content} />))
							: <div className="empty-messages-notify">_ say "Hello!" to your friends _</div>}
					</div>
					<div className="inputs">
						<form className="inputs-group" onSubmit={onSubmitSendHandler}>
							<input
								className="input-message"
								ref={refInput}
								type="text"
								placeholder="message"
								onFocus={() => setIsChatActive(true)}
								onBlur={() => setIsChatActive(false)}
							/>
							<button className="button-send" onClick={onClickSendHandler}><img src="./icon/send-icon.png" /></button>
						</form>
					</div>
				</div>
			</div>
		</>
	)
}
const Message = ({ isMine, name, content }) => {
	return (
		<>
			{
				isMine
					? <div className="message mine">
						<div className="message-content">{content}</div>
					</div>
					: <div className="message their">
						<div className="message-sender">{name}</div>
						<div className="message-content">{content}</div>
					</div>
			}
		</>
	)
}

export default ChatBox;