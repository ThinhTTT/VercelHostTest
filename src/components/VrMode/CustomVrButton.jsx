import './style.css'
import { FaVrCardboard } from "react-icons/fa";
import { toggleSession } from '@react-three/xr'


export const CustomVrButton = () => {
    const handleClick = async () => {
        if (navigator.xr) {
            const isSupported = await navigator.xr.isSessionSupported('immersive-vr');
            if (!isSupported) {
                alert('Your device does not support VR.');
                return;
            }
        } else {
            alert('Your device does not support VR.');
            return;
        }
        const session = await toggleSession('immersive-vr')
      }

    return (
        <div className="vr-button-container">
            <div className="vr-button box-shadow-01" onClick={handleClick}>
            <FaVrCardboard />
            </div>
        </div>
    )
};

export default CustomVrButton;