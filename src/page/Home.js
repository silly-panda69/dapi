import React, { useEffect, useRef, useState } from 'react';
import {FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';

const Home = () => {
    const [media, setMedia] = useState();
    //state not changing fast for window.requestAnimationFrame(predictData);
    //therefore have two variables one let and state for webcam usage
    //camd and cam are same
    let camd=false;
    const [cam,setCam]=useState(false);
    const videoRef = useRef(null);
    const getCam = async () => {
        try {
            const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
            const poseLandmarker = await PoseLandmarker.createFromOptions(
                vision,
                {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
                        delegate: "GPU"
                    },
                    runningMode: "IMAGE",
                    numPoses: 2
                }
            );
            const startTimeMs = performance.now();
            //videotime in negative for comparison
            let lastVideotime=-1;
            const predictData=()=>{
                //videoRef.current.currentTime gives current video play time
                //this is to check if new data is available by comparing previous time and new time of video
                if(lastVideotime!==videoRef.current.currentTime){
                    lastVideotime = videoRef.current.currentTime;
                    poseLandmarker.detect(videoRef.current, startTimeMs, (result) => {
                        // console.log(result['landmarks']);
                    });
                }
                //fires only when webcam is available
                if(camd){
                    //fires when the browser is ready for the fn to fire
                    window.requestAnimationFrame(predictData);
                }
            }
            //waiting for mediastream
            await navigator.mediaDevices.getUserMedia({ video: true }).then((stream)=>{
                setCam(true);
                camd=true;
                //if video tag is available 
                if (videoRef.current) {
                    //input stream into video
                    videoRef.current.srcObject = stream;
                    //predictData is fired when the stream is loaded into video
                    videoRef.current.addEventListener("loadeddata",predictData);
                }
                //store stream into state
                setMedia(stream);
            });
        } catch (err) {
            console.log(err);
        }
    }
    const stopCam = async () => {
        try {
            if (media) {
                const tracks = media.getTracks();
                tracks.forEach(element => {
                    element.stop();
                });
                setMedia();
                setCam(false);
                camd=false;
            }
        } catch (err) {
            console.log(err);
        }
    }
    return (
        <div className='vh-100 bg-light d-flex flex-column justify-content-center align-items-center'>
            <div className='container-fluid d-flex justify-content-center align-items-center gap-3'>
                <video style={{height: "40vw"}} autoPlay ref={videoRef}></video>
            </div>
            <div className='mt-2'>
                {!cam && <button onClick={()=>getCam()} className='btn btn-sm btn-primary'>Start</button>}
                {cam && <button onClick={()=>stopCam()} className='btn btn-sm btn-danger'>Stop</button>}
            </div>
        </div>
    );
}

export default Home;