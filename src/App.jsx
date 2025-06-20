import { Canvas } from "@react-three/fiber";
import Experience  from "./components/Experience";
import { SocketManager, socket } from "./components/SocketManager";
import { EditRoomButton } from "./components/EditRoom";
import ChatBox from "./components/Chat/ChatBox";
import Emotion from "./components/Emotion/Emotion";
import GestureButton from "./components/Gesture/Gesture";
import Meeting from "./components/Meeting/Meeting";
import { Perf } from "r3f-perf";
import * as THREE from "three";
import Login from "./components/Login/Login";
import { useEffect, useState, Suspense } from "react";
import { PerformanceMonitor, View } from "@react-three/drei";
import { ViewModeButton } from "./components/ViewMode/ViewMode";
import { IfcLoader, IFCModelViewer } from "./components/IfcLoader/IfcLoader";
import { IfcLoader2, IFCModelViewer2 } from "./components/IfcLoader2/IfcLoader2";
import ReactLoading from 'react-loading';
import { XR, Controllers, Hands, VRButton, Interactive } from '@react-three/xr';
import CustomVrButton from "./components/VrMode/CustomVrButton";
import Panel from "./components/Test/Panel";
import { GlbLoader } from "./components/GlbLoader";

function App() {
  const [isMobile, setIsMobile] = useState(false);

  const [login, setLogin] = useState(false);
  const [dpr, setDpr] = useState(1.5);
  const onLoginCompleteHandler = (name) => {
    setLogin((pre) => !pre);
  };
  const [url, setUrl] = useState("");

  const checkIfMobile = () => {
    // const isMobileDevice =
    //   /iPhone|iPad|iPod|Android|BlackBerry|Windows Phone/i.test(
    //     navigator.userAgent
    //   );
    // setIsMobile(isMobileDevice);
  };

  // useEffect(() => {
  //   socket.on("generatedUrl", (data) => {
  //     console.log(data);
  //     setUrl(data.url);
  //     //window.history.pushState({}, '', data.url);
  //     // Add a parameter to the URL
  //     const newUrl = window.location.origin + `?Id=${data.url}`;
  //     window.history.pushState({ path: newUrl }, "", newUrl);
  //   });
  //   // Clean up the effect
  //   return () => socket.off("generatedUrl");
  // }, []);

  useEffect(() => {
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  return (
    <>
      <SocketManager />
      {!isMobile ? (
        login ? (
          <>
            <Suspense fallback={
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <ReactLoading type={"spinningBubbles"} color={"#1AC3FF"} height={80} width={80} />
              </div>
            }>
              {/* <VRButton /> */}
              {/* <CustomVrButton /> */}
              <Canvas
                shadows
                shadowMap
                dpr={1}
                gl={{
                  outputEncoding: THREE.sRGBEncoding,
                  toneMapping: THREE.ACESFilmicToneMapping,
                }}
                //camera={{ position: [8, 8, 8], fov: 30 }}
                // camera={{ fov: 30, near: 1.5, far: 1000, position: [8, 8, 8] }}
              >
                <XR
                frameRate={72 | 90 | 120}
                referenceSpace="local-floor"
                >
                  {/* <Perf /> */}
                  <color attach="background" args={["#ececec"]} />
                  <Controllers />
                  <Hands />
                  <Experience />
                  <Panel />
                  <IFCModelViewer />
                  <IFCModelViewer2 />
                  <GlbLoader />
                  <PerformanceMonitor
                    onIncline={() => setDpr(1)}
                    onDecline={() => setDpr(0.5)}
                  />
                </XR>
              </Canvas>

            </Suspense>
            <EditRoomButton />
            <ChatBox />
            <Emotion />
            <GestureButton />
            <ViewModeButton />
            <IfcLoader />
            <IfcLoader2 />
            <CustomVrButton />
            <Meeting />
          </>
        ) : (
          <Login onComplete={onLoginCompleteHandler} />
        )
      ) : (
        <div className="warning">
          <h2>Oops!</h2>
          <p>
            We're sorry, but this website is not optimized for mobile devices.
          </p>
        </div>
      )}
    </>
  );
}

export default App;
