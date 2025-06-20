import React, { useEffect, useState, useRef, Suspense } from "react";
import "./style.css";
import { socket } from "../SocketManager";
import { AnimatedMan } from "../AnimatedMan";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { PerspectiveCamera, OrbitControls } from "@react-three/drei";
import { ChromePicker } from "react-color";
import { BiLeftArrow, BiRightArrow } from "react-icons/bi";
import ReactLoading from "react-loading";

const ColorPickerButton = ({
  color,
  borderColor,
  onClick,
  showColorPicker,
  colorPickerRef,
  setColor,
}) => (
  <div style={{ display: "flex", alignItems: "center" }}>
    <div style={{ position: "relative" }}>
      <button
        style={{
          backgroundColor: color,
          border: `3px solid ${borderColor}`,
          borderRadius: "50%",
          padding: "10px",
          margin: "0 10px",
        }}
        onClick={onClick}
      />
      {showColorPicker && (
        <div
          ref={colorPickerRef}
          style={{
            position: "absolute",
            top: "0px",
            left: "50px",
            zIndex: 2,
          }}
        >
          <ChromePicker
            color={color}
            onChange={(updatedColor) => setColor(updatedColor.hex)}
            disableAlpha
          />
        </div>
      )}
    </div>
  </div>
);

const Login = ({ onComplete }) => {
  // const divInfoRef = useRef();
  const nameRef = useRef("");

  const [roomId, setRoomId] = useState("");
  const [_type, setType] = useState(0);

  const [color, setColor] = useState("#FFFFFF");
  const [headColor, setHeadColor] = useState("#808080"); //gray
  // const borderColor = darkenColor(color, 40);
  // const borderHeadColor = darkenColor(headColor, 40);
  // const [showColorPicker, setShowColorPicker] = useState(false);
  // const [showHeadColorPicker, setShowHeadColorPicker] = useState(false);
  // const colorPickerRef = useRef();
  // const headColorPickerRef = useRef();
  // const camera = useRef(null);

  // function handleShowColorPicker() {
  //   setShowColorPicker(!showColorPicker);
  // }

  // function handleHeadColorPicker() {
  //   setShowHeadColorPicker(!showHeadColorPicker);
  // }

  // function darkenColor(color, percent) {
  //   var num = parseInt(color.replace("#", ""), 16),
  //     amt = Math.round(2.55 * percent),
  //     R = (num >> 16) - amt,
  //     G = ((num >> 8) & 0x00ff) - amt,
  //     B = (num & 0x0000ff) - amt;
  //   return (
  //     "#" +
  //     (
  //       0x1000000 +
  //       (R > 0 ? (R < 255 ? R : 255) : 0) * 0x10000 +
  //       (G > 0 ? (G < 255 ? G : 255) : 0) * 0x100 +
  //       (B > 0 ? (B < 255 ? B : 255) : 0)
  //     )
  //       .toString(16)
  //       .slice(1)
  //   );
  // }

  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (
  //       colorPickerRef.current &&
  //       !colorPickerRef.current.contains(event.target)
  //     ) {
  //       setShowColorPicker(false);
  //     }

  //     if (
  //       headColorPickerRef.current &&
  //       !headColorPickerRef.current.contains(event.target)
  //     ) {
  //       setShowHeadColorPicker(false);
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, []);

  // useEffect(() => {
  //   socket.on("setname", onSetNameCallback);

  //   const queryParams = new URLSearchParams(window.location.search);
  //   const roomIdFromUrl = queryParams.get("Id");

  //   // Set the roomId state
  //   if (roomIdFromUrl) {
  //     //console.log("Id =",roomIdFromUrl);
  //     if (roomIdFromUrl.length > 0 && roomIdFromUrl.length <= 20)
  //       setRoomId(roomIdFromUrl);
  //   }
  // }, []);
  // const onSetNameCallback = ({ name, ID }) => {
  //   if (ID.length < 6) {
  //     divInfoRef.current.innerText =
  //       "Please enter a room id with 6 characters or more";
  //     return;
  //   }
  //   if (nameRef.current === name) {
  //     // set complete
  //     if (onComplete) onComplete();
  //     divInfoRef.current.innerText = "";
  //   } else {
  //     divInfoRef.current.innerText = "this name has already existed";
  //   }
  // };

  // const onSubmitHandler = (e) => {
  //   e.preventDefault();
  //   console.log(e.target);
  //   const name = e.target.elements.name.value;
  //   const roomId = e.target.elements.room.value;
  //   console.log(name + room);
  //   if (name.length >= 2) {
  //     nameRef.current = name;
  //     console.log("login", { name, roomId, type: _type, color: color });
  //     socket.emit("login", {
  //       name,
  //       roomId,
  //       type: _type,
  //       color: { color, headColor },
  //     });
  //   }
  // };

  useEffect(() => {
    const name = "User " + Math.floor(Math.random() * 100);
    const roomId = "123ABC";
    console.log(name + roomId);
      nameRef.current = name;
      console.log("login", { name, roomId, type: _type, color: color });
      socket.emit("login", {
        name,
        roomId,
        type: _type,
        color: { color, headColor },
      });
      onComplete();
  });

  return (
    <div className="ex-container">
      {/* <div className="fixed-box">
        <div
          className={"canvas-box"}
          style={{ zIndex: 1, position: "relative" }}
        >
          <button
            style={{
              position: "absolute",
              left: "-50px",
              top: "75%",
              transform: "translateY(-50%)",
              background: "transparent",
              color: "#ADD8E6",
              fontSize: "2.5em",
              border: "none",
            }}
            onClick={() => setType((pre) => 1 - pre)}
          >
            <BiLeftArrow />
          </button>
          <button
            style={{
              position: "absolute",
              right: "-50px",
              top: "75%",
              transform: "translateY(-50%)",
              background: "transparent",
              color: "#ADD8E6",
              fontSize: "2.5em",
              border: "none",
            }}
            onClick={() => {
              setType((pre) => 1 - pre);
            }}
          >
            <BiRightArrow />
          </button>
          <Suspense
            fallback={
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100vh",
                  marginBottom: "-35%",
                }}
              >
                <ReactLoading
                  type={"spinningBubbles"}
                  color={"#1AC3FF"}
                  height={50}
                  width={50}
                />
              </div>
            }
          >
            <Canvas>
              <OrbitControls target={[0, 1.7, 0]} />
              <PerspectiveCamera
                makeDefault
                fov={29}
                target={[0, 0, 0]}
                position={[3.5, 3.5, 4]}
              />

              <ambientLight intensity={1} />
              <directionalLight
                position={[4, 5, 4]}
                //target={new THREE.Vector3(map.size[0] / 2, 0, map.size[1] / 2)}
                //position={[-4,4,-4]}
                intensity={7}
                castShadow
                shadow-mapSize={[4096, 4096]}
                shadow-camera-near={0.1}
                shadow-camera-far={20}
                shadow-camera-left={-5}
                shadow-camera-right={25}
                shadow-camera-top={10}
                shadow-camera-bottom={-5}
              ></directionalLight>
              <AnimatedMan
                key={_type}
                idChar={"test"}
                type={_type}
                color={color}
                headColor={headColor}
              />
            </Canvas>
          </Suspense>
          <div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <ColorPickerButton
                color={color}
                borderColor={borderColor}
                onClick={handleShowColorPicker}
                showColorPicker={showColorPicker}
                colorPickerRef={colorPickerRef}
                setColor={setColor}
              />
              <ColorPickerButton
                color={headColor}
                borderColor={borderHeadColor}
                onClick={handleHeadColorPicker}
                showColorPicker={showHeadColorPicker}
                colorPickerRef={headColorPickerRef}
                setColor={setHeadColor}
              />
            </div>
          </div>
        </div>
        <div className={"login-box box-shadow-01"}>
          <form id="login-form" onSubmit={onSubmitHandler}>
            <div ref={divInfoRef} className="info"></div>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Your name"
              maxLength={20}
              minLength={2}
            />
            <input
              type="text"
              id="room"
              name="room"
              placeholder="Room id"
              maxLength={20}
              minLength={6}
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
            <button type="submit" form="login-form">
              {" "}
              GO{" "}
            </button>
          </form>
        </div>
      </div> */}
      {/* <Suspense
            fallback={
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100vh",
                  marginBottom: "-35%",
                }}
              >
                <ReactLoading
                  type={"spinningBubbles"}
                  color={"#1AC3FF"}
                  height={50}
                  width={50}
                />
              </div>
            }
          ></Suspense> */}
    </div>
  );
};

export default Login;
