'use client';
import { Player } from "@lottiefiles/react-lottie-player";

export default function Loading() {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Player
                autoplay
                loop
                src="https://lottie.host/32084c93-5799-4939-9b75-c17ddcdd25a6/ZDdJMM2Sj3.json"
                style={{ height: '150px', width: '150px' }}
            />
        </div>
    );
}