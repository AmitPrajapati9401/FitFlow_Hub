import React, { useEffect, useState } from 'react';
import { Landmarks, LandmarkName } from '../types';
import { calculateAngle } from '../utils/poseUtils';

interface PoseOverlayProps {
    landmarks?: Landmarks;
    videoRef: React.RefObject<HTMLVideoElement>;
    activeLandmarks?: [LandmarkName, LandmarkName, LandmarkName];
    isCorrectForm?: boolean;
}

const CONNECTIONS = [
    ['leftShoulder', 'leftElbow'],
    ['leftElbow', 'leftWrist'],
    ['rightShoulder', 'rightElbow'],
    ['rightElbow', 'rightWrist'],
    ['leftShoulder', 'rightShoulder'],
    ['leftHip', 'rightHip'],
    ['leftShoulder', 'leftHip'],
    ['rightShoulder', 'rightHip'],
    ['leftHip', 'leftKnee'],
    ['leftKnee', 'leftAnkle'],
    ['rightHip', 'rightKnee'],
    ['rightKnee', 'rightAnkle'],
];

const PoseOverlay: React.FC<PoseOverlayProps> = ({ landmarks, videoRef, activeLandmarks, isCorrectForm = true }) => {
    const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            const updateDimensions = () => {
                setVideoDimensions({
                    width: video.clientWidth,
                    height: video.clientHeight,
                });
            };

            video.addEventListener('loadedmetadata', updateDimensions);
            window.addEventListener('resize', updateDimensions);
            updateDimensions(); // Initial call

            return () => {
                video.removeEventListener('loadedmetadata', updateDimensions);
                window.removeEventListener('resize', updateDimensions);
            };
        }
    }, [videoRef]);

    if (!landmarks || videoDimensions.width === 0) {
        return null;
    }
    
    // Scale normalized landmarks to video dimensions
    const scaledLandmarks: { [key: string]: { x: number, y: number } } = {};
    for (const key in landmarks) {
        scaledLandmarks[key] = {
            x: landmarks[key].x * videoDimensions.width,
            y: landmarks[key].y * videoDimensions.height,
        };
    }

    const isActiveJoint = (name: string) => activeLandmarks?.includes(name as LandmarkName);

    let angle: number | null = null;
    let middleJoint: {x: number, y: number} | null = null;

    if (activeLandmarks && activeLandmarks.length === 3) {
        const [p1, p2, p3] = activeLandmarks;
        if (landmarks[p1] && landmarks[p2] && landmarks[p3]) {
            angle = calculateAngle(landmarks[p1], landmarks[p2], landmarks[p3]);
            middleJoint = scaledLandmarks[p2];
        }
    }

    const colorScheme = isCorrectForm ? "#a3e635" : "#fbbf24"; // Lime or Amber

    return (
        <svg
            className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 transform scaleX(-1)"
            viewBox={`0 0 ${videoDimensions.width} ${videoDimensions.height}`}
        >
            {/* Draw connections */}
            {CONNECTIONS.map(([start, end], i) => {
                const startPoint = scaledLandmarks[start];
                const endPoint = scaledLandmarks[end];
                const active = isActiveJoint(start) && isActiveJoint(end);

                if (startPoint && endPoint) {
                    return (
                        <line
                            key={i}
                            x1={startPoint.x}
                            y1={startPoint.y}
                            x2={endPoint.x}
                            y2={endPoint.y}
                            stroke={active ? colorScheme : "rgba(255, 255, 255, 0.15)"}
                            strokeWidth={active ? "6" : "2"}
                            strokeLinecap="round"
                            opacity="0.8"
                        />
                    );
                }
                return null;
            })}

            {/* Draw landmarks */}
            {Object.entries(scaledLandmarks).map(([name, point], i) => {
                const active = isActiveJoint(name);
                return (
                    <circle
                        key={i}
                        cx={point.x}
                        cy={point.y}
                        r={active ? "9" : "3"}
                        fill={active ? colorScheme : "rgba(255, 255, 255, 0.4)"}
                        stroke={active ? "#ffffff" : "transparent"}
                        strokeWidth="2"
                        opacity="0.9"
                    />
                );
            })}

            {/* Real-time Angle Gauge */}
            {angle !== null && middleJoint && (
                <g transform={`translate(${middleJoint.x}, ${middleJoint.y})`}>
                    <rect 
                        x="20" 
                        y="-45" 
                        width="70" 
                        height="40" 
                        rx="12" 
                        fill="rgba(0,0,0,0.8)" 
                        stroke={colorScheme}
                        strokeWidth="1"
                        transform="scale(-1, 1)"
                    />
                    <text 
                        x="-55" 
                        y="-18" 
                        fill={colorScheme} 
                        fontSize="20" 
                        fontWeight="900"
                        textAnchor="middle"
                        className="font-mono tracking-tighter"
                    >
                        {Math.round(angle)}°
                    </text>
                </g>
            )}
        </svg>
    );
};

export default PoseOverlay;