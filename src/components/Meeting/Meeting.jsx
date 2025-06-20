import React, { Component, useEffect, useState, useRef } from "react";
import { socket, charsInfoItom, isSharingScreenAtom } from "../SocketManager";
import "./style.css";
import Call from "./Call";
import { useAtom } from "jotai";
import RecordRTC from "recordrtc";
import { useLocalCharacter } from "../../hooks/useStore";

let mediaRecorder;
let mediaStream;
const Meeting = (props) => {
  const [audio, setAudio] = useState(true);
  const [video, setVideo] = useState(true);
  //const [inMeeting, setInMeeting] = useState(false);
  // const setIsChatActive = useLocalCharacter((state) => state.setIsChatActive)
	// const isChatActive = useLocalCharacter((state) => state.isChatActive)
  const inMeeting = useLocalCharacter((state) => state.inMeeting)
  const setInMeeting = useLocalCharacter((state) => state.setInMeeting)
  const [calls, setCalls] = useState([]);
  const [shareScreen, setShareScreen] = useState(false);
  const localVideoRef = useRef(null);
  const localStream = useRef(null);
  const [tempStream, setTempStream] = useState(null);

  const streamRef = useRef(null);
  const [pc, setPc] = useState([]);
  const [isSharingScreen, SetIsSharingScreen] = useAtom(isSharingScreenAtom);
  const [idShareScreen, setIdShareScreen] = useState("");
  const [infos] = useAtom(charsInfoItom);
  const [nameSharing, setNameSharing] = useState("");
  const idUserSharing = useRef("");

  const [isRecording, SetIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);

  const [fullShareScreen, setFullShareScreen] = useState(false);

  const recordRef = useRef(null);

  const handleNameSharing = ({ nameShare, idSharingUser }) => {
    setNameSharing(nameShare);
    if (idSharingUser) idUserSharing.current = idSharingUser;
    else idUserSharing.current = "";
  };
  const handleIdShareScreen = (e) => {
    setIdShareScreen(e);
  };

  const PC = (e) => {
    setPc((current) => [...current, e]);
  };

  const removePC = (pc) => {
    setPc((current) => current.filter((e) => e !== pc));
  };

  const leaveShareScreen = ({ id }) => {
    if (!shareScreen && id === idUserSharing.current) {
      setIdShareScreen("");
      setShareScreen("");
      setNameSharing("");
    }
  };

  const videoRef = useRef(null);

  const addSocketEvents = () => {
    socket.on("joinCall", onOtherJoinCall);
    socket.on("initCall", initCall);
    socket.on("hangup", onOtherHangup);
    socket.on("reInitCall", onReInitCall);
    socket.on("leaveShareScreen", leaveShareScreen);
  };

  const removeSocketEvents = () => {
    socket.off("joinCall", onOtherJoinCall);
    socket.off("initCall", initCall);
    socket.off("hangup", onOtherHangup);
    socket.off("reInitCall", onReInitCall);
    socket.off("leaveShareScreen", leaveShareScreen);
  };

  useEffect(() => {
    addSocketEvents();

    return () => {
      removeSocketEvents();
      if (localStream.current) {
        localStream.current?.getVideoTracks()[0]?.stop();
        localStream.current?.getAudioTracks()[0]?.stop();
        localStream.current = null;
      }
    };
  }, [inMeeting]);

  useEffect(() => {
    localStream.current = tempStream;

    if (
      localStream.current != null &&
      localStream.current.getAudioTracks() != null &&
      localStream.current.getVideoTracks() != null
    ) {
      localStream.current.getAudioTracks()[0].enabled = audio;
      localStream.current.getVideoTracks()[0].enabled = video;
    }
  }, [tempStream]);

  useEffect(() => {
    if (shareScreen && streamRef.current && pc.length > 0) {
      try {
        socket.emit("startShareScreen", {
          idShare: streamRef.current.id,
          nameShare: nameSharing,
          idSharingUser: socket.id,
        });

        pc.forEach((peerConnection) => {
          if (peerConnection.signalingState === "stable") {
            const screenSharingTracks = streamRef.current.getTracks();
            const existingSenders = peerConnection.getSenders();
            const existingTrackIds = existingSenders.map(
              (sender) => sender.track.id
            );

            screenSharingTracks.forEach((track) => {
              if (!existingTrackIds.includes(track.id)) {
                peerConnection.addTrack(track, streamRef.current);
              }
            });
          }
        });
      } catch (error) {
        console.error("Error sharing screen:", error);
      }
    }
  }, [pc]);

  const onOtherJoinCall = (id) => {
    if (!inMeeting) return;
    socket.emit("connectCall", { host: socket.id, id });
  };

  const initCall = ({ host, id }) => {
    if (!inMeeting) return;
    if (host !== socket.id && id !== socket.id) return;
    const isHost = host === socket.id;
    setCalls((prevCalls) => {
      const call = (
        <Call
          key={`${host}_${id}`}
          id={socket.id}
          otherId={socket.id === id ? host : id}
          isHost={isHost}
          shareScreen={shareScreen}
          PC={PC}
          removePC={removePC}
          videoRef={videoRef}
          handleNameSharing={handleNameSharing}
          idShareScreen={idShareScreen}
          handleIdShareScreen={handleIdShareScreen}
          localStream={localStream.current ? localStream.current : tempStream}
          onRemoteDisconnected={onRemoteDisconnectedHandler}
          onConnectFailed={onConnectFailed}
        />
      );
      return [...prevCalls, call];
    });
  };

  const onOtherHangup = ({ id }) => {
    if (id !== socket.id) removeCallId(id);
  };

  const requestMedia = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .catch((e) => {
        console.log("LOI NE: " + e);
        var audioTrack = createDummyAudioTrack();
        var videoTrack = createDummyVideoTrack();
        console.log("NEW audioTrack NE", audioTrack);
        console.log("NEW videoTrack NE", videoTrack);
        // Create a MediaStream with the dummy tracks
        var newStream = new MediaStream([audioTrack, videoTrack]);

        newStream
          .getTracks()
          .forEach((track) => console.log("TRACK NE", track));
        localVideoRef.current.srcObject = newStream;

        setTempStream(newStream);

        socket.emit("joinCall");
        console.log("socket.emit joinCall");

        //setInMeeting(false);
      })
      .then((stream) => {
        localVideoRef.current.srcObject = stream;
        localStream.current = stream;
        if (
          localStream.current != null &&
          localStream.current.getAudioTracks() != null &&
          localStream.current.getVideoTracks() != null
        ) {
          localStream.current.getAudioTracks()[0].enabled = audio;
          localStream.current.getVideoTracks()[0].enabled = video;
        }
        if (localStream.current != null) {
          socket.emit("joinCall");
          console.log("socket.emit joinCall");
        }
      });
  };

  useEffect(() => {
    if (inMeeting) {
      onClickCallHandler();
    } else {
      onClickHangupHandler();
    }
  }, [inMeeting]);

  const onClickCallHandler = () => {
    requestMedia();
    //setInMeeting(true);
  };

  const onClickHangupHandler = () => {
    if (shareScreen) {
      socket.emit("stopShareScreen");
      setNameSharing("");
      idUserSharing.current = "";
    }
    if (isRecording) {
      onStopRecording();
    }
    onZoomInScreen();
    //setInMeeting(false);
    if (localStream.current) {
      localStream.current?.getVideoTracks()[0]?.stop();
      localStream.current?.getAudioTracks()[0]?.stop();
      localStream.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      setShareScreen(false);
    }

    setCalls([]);
    socket.emit("hangup");
  };

  const onClickToggleAudioHandler = () => {
    const audioEnable = !audio;
    setAudio(audioEnable);
    localStream.current.getAudioTracks()[0].enabled = audioEnable;
  };

  const onClickToggleVideoHandler = () => {
    const videoEnable = !video;
    setVideo(videoEnable);
    localStream.current.getVideoTracks()[0].enabled = videoEnable;
  };

  const onClickToggleShareScreenHandler = async () => {
    try {
      if (!idShareScreen && !shareScreen) {
        if (!shareScreen) {
          const stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true,
          });

          //set name for tag sharing
          const name = infos.find((i) => i.id === socket.id)?.name ?? "";
          const nameShare = name
            ? `${name} is sharing screen`
            : "Sharing screen";
          setNameSharing(nameShare);
          idUserSharing.current = socket.id;
          SetIsSharingScreen(!isSharingScreen);
          socket.emit("startShareScreen", {
            idShare: stream.id,
            nameShare,
            idSharingUser: socket.id,
          });
          streamRef.current = stream;
          videoRef.current.srcObject = stream;

          try {
            pc.forEach((peerConnection) => {
              if (peerConnection.signalingState === "stable") {
                stream.getTracks().forEach((track) => {
                  peerConnection.addTrack(track, stream);
                });
              }
            });
          } catch (error) {
            console.error("Error sharing screen:", error);
          }
        } else {
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => {
              track.stop();
            });
            setNameSharing("Stop sharing");
            idUserSharing.current = "";
            socket.emit("stopShareScreen");
            onZoomInScreen();
          }
        }
        setShareScreen(!shareScreen);
      } else {
        if (shareScreen && streamRef.current) {
          streamRef.current.getTracks().forEach((track) => {
            track.stop();
          });
          socket.emit("stopShareScreen");
          setNameSharing("Stop sharing");
          onZoomInScreen();
          idUserSharing.current = "";
          setShareScreen(!shareScreen);
        }
      }
      
    } catch (error) {
      console.log("Error onClickToggleShareScreenHandler", error);
    }
  };

  const onRemoteDisconnectedHandler = (remoteId) => {
    removeCallId(remoteId);
  };

  const onConnectFailed = (otherId) => {
    setCalls((prevCalls) => {
      const call = prevCalls.find((c) => c.props.otherId == otherId);
      if (call) {
        const host = call.props.isHost ? socket.id : remoteId;
        const remoteId = host === remoteId ? socket.id : remoteId;
        socket.emit("reInitCall", { host: host, remoteId: remoteId });
        return prevCalls.filter((c) => c.props.otherId != otherId);
      } else {
        return prevCalls;
      }
    });
  };

  const onReInitCall = ({ host, id }) => {
    if (!inMeeting) return;
    if (host !== socket.id && id !== socket.id) return;
    const isHost = host == socket.id;
    setCalls((prevCalls) =>
      prevCalls.filter((c) => c.props.otherId != otherId)
    );
    socket.emit("connectCall", { host, id });
  };

  const removeCallId = (id) => {
    setCalls((prevCalls) => prevCalls.filter((c) => c.props.otherId != id));
  };

  const onRecording = async () => {
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        mediaStream = videoRef.current.srcObject;

        let audioStreams = await getAudioStreamFromAnotherSource();

        const mergedStream = await mergeStreams(mediaStream, ...audioStreams);

        mediaRecorder = RecordRTC(mergedStream, {
          type: "video",
          mimeType: "video/webm",
        });
        mediaRecorder.startRecording();
        SetIsRecording(true);
      }
    } catch (error) {
      console.error("Error accessing microphone and camera:", error);
    }
  };

  const onStopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stopRecording(() => {
        SetIsRecording(false);
        setRecordedBlob(mediaRecorder.getBlob());
      });
    }
  };

  const playRecording = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      recordRef.current.src = url;
      recordRef.current.controls = true;
      recordRef.current.play();
    }
  };
  const saveRecording = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "recorded_video.webm";
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const discardRecording = () => {
    setRecordedBlob(null);
  };

  const getAudioStreamFromAnotherSource = async () => {
    // For demonstration purposes, return a stream from an audio file
    let audioStreamArray = [];
    pc.forEach((peerConnection) => {
      if (
        peerConnection != null &&
        peerConnection.getRemoteStreams() != null &&
        peerConnection.getRemoteStreams().length > 0
      ) {
        const remoteStream = peerConnection.getRemoteStreams()[0];
        const audioTracks = remoteStream
          .getTracks()
          .filter((track) => track.kind === "audio");

        // Create a new MediaStream
        const newAudioStream = new MediaStream();

        // Add the audio tracks to the new MediaStream
        audioTracks.forEach((track) => newAudioStream.addTrack(track));

        audioStreamArray.push(newAudioStream);
      }
    });
    return audioStreamArray;
  };

  const mergeVideoStream = (videoStream, audioStream) => {
    const mergedStream = new MediaStream();
    const videoTracks = videoStream
      .getTracks()
      .filter((track) => track.kind === "video");
    videoTracks.forEach((track) => mergedStream.addTrack(track));
    audioStream.getTracks().forEach((track) => mergedStream.addTrack(track));
    return mergedStream;
  };

  const mergeStreams = async (videoStream, ...audioStreams) => {
    const audioContext = new AudioContext();
    const destination = audioContext.createMediaStreamDestination();
    let isHasAudio = false;
    if (videoStream.getAudioTracks().length > 0) {
      const videoSource = audioContext.createMediaStreamSource(videoStream);
      if (videoSource) {
        const videoGainNode = audioContext.createGain();
        videoSource.connect(videoGainNode);
        videoGainNode.connect(destination);
        isHasAudio = true;
      }
    }
    for (const audioStream of audioStreams) {
      const audioSource = audioContext.createMediaStreamSource(audioStream);
      const audioGainNode = audioContext.createGain();
      audioSource.connect(audioGainNode);
      audioGainNode.connect(destination);
      isHasAudio = true;
    }

    await audioContext.resume();
    return isHasAudio
      ? mergeVideoStream(videoStream, destination.stream)
      : videoStream;
  };
  const onZoomOutScreen =async () => {
    setFullShareScreen(true);
    console.log(" setFullShareScreen true");
  };
  const onZoomInScreen = async () => {
    setFullShareScreen(false);
    console.log(" setFullShareScreen false");

  };

  return (
    <div className="outer-container">
      <div
        className={
         `
         ${fullShareScreen ?["fixed-box meeting-box box-shadow-01", "share"].join()
         :["fixed-box meeting-box box-shadow-01", "collapse"].join()}
         `}
      >
        {inMeeting ? (
          
          <div className="on-call">
            <div className= {` ${
                 fullShareScreen?
                    "list-calls-share-full-screen" :  "list-calls box-shadow-01" 
                  //!fullShareScreen && "call-peer" 
                }
                `}>

           
              <div className={` ${
                  fullShareScreen?
                    "list-video-user-share-screen " :  "list-video-user" 
                  //!fullShareScreen && "call-peer" 
                }
                `}
                >
              <div className="local-video">
                <div className="name">You</div>
                <video ref={localVideoRef} autoPlay muted="muted"></video>
              </div>
              {calls}
              </div>
              <div
                className={`${
                  nameSharing.includes("is sharing screen")
                    ? "show-sharing"
                    : "hide-sharing"
                }
                ${
                  fullShareScreen?
                    "call-peer-share-screen-1" :  "call-peer" 
                  //!fullShareScreen && "call-peer" 
                }
                `}
              >
                <div className="name">{nameSharing}</div>
                    
                    {
                        (!fullShareScreen ? (
                          <div
                            className="zoom-button"
                            onClick={onZoomOutScreen}
                          >
                            <img src="/icon/expand.png" />
                          </div>
                        ) : (
                          <div
                            className="zoom-button zoom-out"
                            onClick={onZoomInScreen}
                          >
                          <img src="/icon/minimize.png" />
                          </div>
                        ))}
                  <div className="sharescreenbutton">
               <video id="share-screen" ref={videoRef} autoPlay >
              </video> </div>
              </div>
            </div>
            <div className="controll-buttons fixed-control-box">
              <div
                className="circle-button mic-button"
                onClick={onClickToggleAudioHandler}
              >
                {audio ? (
                  <img src="/icon/icon-mic-on.png" />
                ) : (
                  <img src="/icon/icon-mic-off.png" />
                )}
              </div>
              <div
                className="circle-button video-button"
                onClick={onClickToggleVideoHandler}
              >
                {video ? (
                  <img src="/icon/icon-video-on.png" />
                ) : (
                  <img src="/icon/icon-video-off.png" />
                )}
              </div>
              <div
                className="circle-button share-screen-button"
                // className={`circle-button ${
                //   shareScreen
                //     ? "active-share-screen-button"
                //     : "share-screen-button"
                // }`}
                onClick={onClickToggleShareScreenHandler}
              >
                <img src="/icon/present.png" />
              </div>
              <div
                className="circle-button hangup-button"
                onClick={() => setInMeeting(false)}
              >
                <img src="/icon/icon-hangup.png" />
              </div>
              
              {videoRef.current &&
                videoRef.current.srcObject &&
                (!isRecording ? (
                  <div
                    className="round-button recording-button"
                    onClick={onRecording}
                  >
                    <img src="/icon/record.png" />
                  </div>
                ) : (
                  <div
                    className="round-button recording-button"
                    onClick={onStopRecording}
                  >
                    <img className="blink_me" src="/icon/rounded-square.png" />
                  </div>
                ))}
                
            </div>
          </div>
        ) : (
          <div className="controll-buttons fixed-control-box">
            <div
              className="circle-button call-button"
              onClick={() => setInMeeting(true)}
            >
              <img src="/icon/icon-hangup.png" />
            </div>
          </div>
        )}
      </div>
      {recordedBlob && !isRecording && (
        <div className="video-container">
          <div className="name-tag">Recorded video</div>
          <video id="preview-screen" ref={recordRef} autoPlay />
          <div className="buttons">
            <button
              className="round-button"
              onClick={() => playRecording()}
              disabled={!recordedBlob}
            >
              <img src="/icon/play-button.png" />
            </button>
            <button
              className="round-button"
              onClick={() => saveRecording()}
              disabled={!recordedBlob}
            >
              <img src="/icon/save.png" />
            </button>
            <button
              className="round-button"
              onClick={() => discardRecording()}
              disabled={!recordedBlob}
            >
              <img src="/icon/x-icon.png" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Meeting;

function createDummyAudioTrack() {
  var audioContext = new AudioContext();
  var oscillator = audioContext.createOscillator();
  var destination = oscillator.connect(
    audioContext.createMediaStreamDestination()
  );
  oscillator.start();
  return destination.stream.getAudioTracks()[0];
}

// Function to create a dummy video track
function createDummyVideoTrack() {
  var canvas = Object.assign(document.createElement("canvas"), {
    width: 640,
    height: 480,
  });
  var context = canvas.getContext("2d");
  context.fillStyle = "black";
  context.fillRect(0, 0, canvas.width, canvas.height);
  var stream = canvas.captureStream();
  return stream.getVideoTracks()[0];
}
