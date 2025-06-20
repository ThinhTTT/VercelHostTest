import React, { Component, useEffect, useState, useRef } from 'react'
import { socket,charsInfoItom,videoTextureRefsAtom,isSharingScreenAtom } from '../SocketManager';
import { atom, useAtom } from "jotai";

const Call = (props) => {
    const { id, otherId, isHost} = props
    let pc = null;
    let localStream = props.localStream;
    let remoteStream = {};
    const remoteVideo = useRef(null);
    let dc =null;
    const videoRef = props.videoRef;
    let shareScreen = props.shareScreen;
    let idShareScreen = props.idShareScreen;
	const [isSharingScreen, SetIsSharingScreen] = useAtom(isSharingScreenAtom);

    const startShareScreen = async ({nameShare, idShare, idSharingUser}) => {
        idShareScreen = idShare
        props.handleIdShareScreen(idShare)
        props.handleNameSharing({nameShare, idSharingUser})
	  };

      const stopShareScreen = () => {
        idShareScreen = ""
        props.handleIdShareScreen("")
        props.handleNameSharing({nameShare: "Stop sharing"})
      }

    const init = async () => {
        pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });

        pc.onicecandidate = e => {
            if (e.candidate) {
                socket.emit('candidate', { to: otherId, candidate: e.candidate});
            }
        };

        pc.onaddstream = e => {
            try {
                if(!shareScreen ){
                    remoteStream = e.stream;
                    remoteVideo.current.srcObject = e.stream;
                }
                
            } catch (error) {
                console.log("error onaddstream",error);
            }
        };

        pc.ondatachannel = e => {
            dc = e.channel;
            setupDataHandlers();
        };

        localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
        
        if (isHost) {
            dc = pc.createDataChannel('chat');
            setupDataHandlers();
            pc.createOffer()
                .then(setDescription)
                .then(sendOffer)
                .catch(handleError);
        }

        pc.ontrack = handleTrack
        pc.onnegotiationneeded = async ()=>{
            if(shareScreen){
                try {
                    // Tạo offer mới
                    const offer = await pc.createOffer();
                    // Đặt mô tả session local
                    await pc.setLocalDescription(offer);
                    // Gửi offer tới bên đối tác
                    socket.emit('offer', { to: otherId, offer });
                } catch (error) {
                    console.error('Error handling negotiation:', error);
                }
            }
            
        }

    }

    const handleTrack = (event)=>{
        if(idShareScreen !== event.streams[0].id){
            remoteVideo.current.srcObject = event.streams[0];
            shareScreen = true
        }else{
            videoRef.current.srcObject = event.streams[0];
            SetIsSharingScreen(!isSharingScreen);

        }
        console.log("error handleTrack",event.streams);

    }

    const handleError =(e) => {
		console.log("handleError", e)
	}

	const addSocketEvents =() => {
		socket.on('offer', onOffer)
		socket.on('answer', onAnswer)
		socket.on('candidate', onCandidate)
		socket.on('startShareScreen', startShareScreen);
        socket.on('stopShareScreen', stopShareScreen);
    }

    const removeSocketEvents =()=> {
		socket.off('offer', onOffer)
		socket.off('answer', onAnswer)
		socket.off('candidate', onCandidate)
		socket.off('stopShareScreen', stopShareScreen);
        socket.off('startShareScreen', startShareScreen);
    }

    const setupDataHandlers =() =>{
        dc.onmessage = e => {
            var msg = JSON.parse(e.data);
        };
        dc.onclose = () => {
            remoteStream?.getAudioTracks()[0]?.stop();
            remoteStream?.getVideoTracks()[0]?.stop();
            (props.onRemoteDisconnected) && props.onRemoteDisconnected(otherId)
        };
    }

    const setDescription =(offer)=> {
        return pc.setLocalDescription(offer);
    }

    // send the offer to a server to be forwarded to the other peer
    const sendOffer=() => {
        socket.emit('offer', { to: otherId, offer: pc.localDescription });
    }

    const sendOfferAnswer=() =>{
        socket.emit('answer', { to: otherId, answer: pc.localDescription });
    }

    const onOffer=({ from, to, offer })=> {
        if (to!=id || from!=otherId) return;
		pc.setRemoteDescription(new RTCSessionDescription(offer))
			.then(() => pc.createAnswer())
			.then(setDescription)
			.then(sendOfferAnswer)
			.catch(handleError); // An error occurred, so handle the failure to connect
	}

	const onAnswer=({ from, to, answer })=> {
        if (to!=id || from!=otherId) return;
		pc.setRemoteDescription(new RTCSessionDescription(answer));
	}

	const onCandidate =({from, to, candidate })=> {
        if (to!=id || from!=otherId) return;
        try {
            pc.addIceCandidate(candidate);
        } catch {
            if (props.onConnectFailed) props.onConnectFailed(otherId)
        }
	}

    useEffect(()=>{
        addSocketEvents();
        init();
        props?.PC(pc)

        return () => {
            removeSocketEvents();
            pc?.close();
            dc?.close();
        };
    },[props])


    return (
        <div className='call-peer'>
            <Name id={otherId} />
            <video id={otherId+"_video"} data-id={id} data-other={otherId} ref={(ref) => remoteVideo.current = ref} autoPlay></video>
            <VideoCall dataid={id} dataother={otherId} remoteVideo={remoteVideo.current} ></VideoCall>
        </div>)
};

export default Call;

export const Name = ({ id }) => {

	const [ infos ] = useAtom(charsInfoItom);

    return (
        <div className='name'>{ infos.find(i => i.id === id)?.name ?? '' }</div> 
    )
}

export const VideoCall = ({dataid,dataother,remoteVideo}) => {
    const [_videoTextureRefs, setVideoTextureRefs] = useAtom(videoTextureRefsAtom);

  useEffect(() => {
        setVideoTextureRefs(current => [...current,dataother]);
    return()=>{
        setVideoTextureRefs(_videoTextureRefs.filter(item => item !== dataother))
    }
  }, [dataother]);

  return () => {
  };
};

