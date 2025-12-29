# FitFlow Hub - AI Fitness Companion

FitFlow Hub is an advanced, privacy-first AI fitness application that uses real-time computer vision to track your exercise form and count repetitions. No video data is ever sent to a server; all pose detection happens directly in your browser using MediaPipe.

## 📸 Application Gallery


### 1. The Command Center (Home)
The primary entry point where users monitor daily frequency and coaching recommendations.
![Home Screen](./FFH%20Home%20Screen.png)

### 2. Biometric Entry (Authentication)
Hands-free authentication using Gemini's vision-multimodal recognition.
| **Neural Login** | **Athlete Onboarding** |
|:---:|:---:|
| ![Login](./Login%20Page.png) | ![SignUp](./SignUp%20Page.png) |

### 3. Training Protocols (Workout Plans)
Comprehensive exercise selection with difficulty-tiered plans and real-time randomization.
| **Plan Overview** | **Movement Breakdown** | **Active Circuit** |
|:---:|:---:|:---:|
| ![Plan 1](./Plan%20Screen.png) | ![Plan 2](./Plan%20Screen%202.png) | ![Plan 3](./Plan%20Screen%203.png) |

### 4. Neural Analytics (Progress)
Deep-dive intelligence tracking strength trends, volume loads, and metabolic age.
| **Metabolic Trends** | **Strength Analytics** |
|:---:|:---:|
| ![Progress 1](./Progress%20Screen%201.png) | ![Progress 2](./Progress%20Screen%202.png) |

### 5. Interface Protocol (Settings)
Customizing the hardware/software link and athlete bio-metrics.
| **Bio-Data Sync** | **Fitness Level Config** |
|:---:|:---:|
| ![Settings 1](./Settings%20Screen%201.png) | ![Settings 2](./Settings%20Screen%202.png) |

------

## 🌟 Key Features
- **Real-time Pose Tracking**: 33 landmark points tracked at up to 60fps using MediaPipe.
- **Biomechanical Feedback**: Instant angle calculations for Squats, Pushups, and more.
- **Privacy First**: All neural processing is client-side. No video leaves your device.
- **Biometric Login**: Hands-free authentication powered by Google Gemini multimodal analysis.
- **Advanced Insights**: Automated calculation of BMR, BMI, and relative Metabolic Age.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- A modern browser with webcam access (Chrome/Edge recommended)

### Local Development
1. **Initialize Project**
   ```bash
   npm install
   ```

2. **Configure Security**
   Create a `.env` file with your Gemini API key:
   ```env
   API_KEY=your_google_ai_studio_key
   ```

3. **Launch Terminal**
   ```bash
   npm run dev
   ```

## 🛠 Tech Stack
- **React 19**: Modern UI component architecture.
- **MediaPipe Tasks Vision**: High-performance on-device pose estimation.
- **Framer Motion**: Smooth, cinematic transitions.
- **Tailwind CSS**: Utility-first responsive design.
- **Google Gemini API**: Advanced user recognition and multimodal analysis.

## 🔒 Security & Privacy
FitFlow Hub is built on the principle of **Edge AI**. Your webcam feed is used solely to generate coordinate data (landmarks) which is processed in volatile memory. No audio or video data is persisted or transmitted to external servers.

## 📄 License
This project is licensed under the MIT License.
