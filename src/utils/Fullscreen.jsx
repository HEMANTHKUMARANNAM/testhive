import React, { useEffect, useRef, useState } from "react";
import screenfull from "screenfull";

const FullscreenTracker = ({ violation, setviolation }) => {
    const containerRef = useRef(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [exitCount, setExitCount] = useState(0);
    const [switchCount, setSwitchCount] = useState(0);
    const [hoverLeaveCount, setHoverLeaveCount] = useState(0);
    const [keypressCount, setKeypressCount] = useState(0);
    const [totalBlurTime, setTotalBlurTime] = useState(0);
    const [totalHoverLeaveTime, setTotalHoverLeaveTime] = useState(0);

    const blurStartRef = useRef(null);
    const hoverLeaveStartRef = useRef(null);

    const toggleFullscreen = () => {
        if (screenfull.isEnabled) {
            screenfull.toggle(containerRef.current);
        }
    };

    useEffect(() => {
        if (!screenfull.isEnabled) return;

        const onChange = () => {
            const fs = screenfull.isFullscreen;
            setIsFullscreen(fs);
            if (!fs) {
                setExitCount((prev) => prev + 1);
            }
        };

        screenfull.on("change", onChange);
        return () => screenfull.off("change", onChange);
    }, []);

    useEffect(() => {
        const handleBlur = () => {
            blurStartRef.current = Date.now();
            setviolation((prev) => prev + 1);
            setSwitchCount((prev) => prev + 1);
        };

        const handleFocus = () => {
            if (blurStartRef.current) {
                const duration = Date.now() - blurStartRef.current;
                setTotalBlurTime((prev) => prev + duration);
                blurStartRef.current = null;
            }
        };

        window.addEventListener("blur", handleBlur);
        window.addEventListener("focus", handleFocus);
        return () => {
            window.removeEventListener("blur", handleBlur);
            window.removeEventListener("focus", handleFocus);
        };
    }, [setviolation]);

    useEffect(() => {
        const handleMouseLeave = (e) => {
            if (
                e.clientY <= 0 ||
                e.clientX <= 0 ||
                e.clientX >= window.innerWidth ||
                e.clientY >= window.innerHeight
            ) {
                setHoverLeaveCount((prev) => prev + 1);
                hoverLeaveStartRef.current = Date.now();
            }
        };

        const handleMouseEnter = () => {
            if (hoverLeaveStartRef.current) {
                const duration = Date.now() - hoverLeaveStartRef.current;
                setTotalHoverLeaveTime((prev) => prev + duration);
                hoverLeaveStartRef.current = null;
            }
        };

        document.addEventListener("mouseleave", handleMouseLeave);
        document.addEventListener("mouseenter", handleMouseEnter);
        return () => {
            document.removeEventListener("mouseleave", handleMouseLeave);
            document.removeEventListener("mouseenter", handleMouseEnter);
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = () => {
            if (document.hidden || document.activeElement.tagName === "BODY") {
                setKeypressCount((prev) => prev + 1);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
        const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
        const s = String(totalSeconds % 60).padStart(2, "0");
        return `${h}:${m}:${s}`;
    };

    // Styles
    const styles = {
        wrapper: {
            padding: "20px",
            fontFamily: "'Inter', 'Segoe UI', Tahoma, sans-serif",
            background: "linear-gradient(135deg, #f0f4f8, #d9eaf7)",
            minHeight: "100vh",
        },
        button: {
            padding: "14px 28px",
            fontSize: "16px",
            backgroundColor: isFullscreen ? "#ef5350" : "#43a047",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
            transition: "background-color 0.3s ease",
        },
        container: {
            marginTop: "30px",
            padding: "30px",
            backgroundColor: "#1e1e2f",
            color: "#f5f5f5",
            borderRadius: "12px",
            height: isFullscreen ? "100vh" : "auto",
            overflowY: isFullscreen ? "auto" : "visible",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.2)",
        },
        header: {
            fontSize: "24px",
            marginBottom: "20px",
            fontWeight: "bold",
            textAlign: "center",
        },
        grid: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
        },
        card: {
            background: "#2c2c3d",
            padding: "20px",
            borderRadius: "10px",
            textAlign: "center",
            transition: "transform 0.3s ease",
            boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
        },
        cardTitle: {
            fontSize: "15px",
            color: "#90caf9",
            marginBottom: "8px",
            fontWeight: "500",
        },
        cardSubtitle: {
            fontSize: "13px",
            color: "#b0bec5",
            marginBottom: "8px",
        },
        cardValue: {
            fontSize: "28px",
            fontWeight: "bold",
            color: "#fff",
        },
    };

    return (
        <div style={styles.wrapper}>
            <div style={{ textAlign: "center" }}>
                <button style={styles.button} onClick={toggleFullscreen}>
                    {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                </button>
            </div>

            <div ref={containerRef} style={styles.container}>
                <div style={styles.header}>🛡 Fullscreen Activity Tracker</div>
                <div style={styles.grid}>
                    <div style={styles.card}>
                        <div style={styles.cardTitle}>⛔ Exits Fullscreen</div>
                        <div style={styles.cardValue}>{exitCount}</div>
                    </div>
                    <div style={styles.card}>
                        <div style={styles.cardTitle}>🔄 Tab Switches</div>
                        <div style={styles.cardValue}>{switchCount}</div>
                    </div>
                    <div style={styles.card}>
                        <div style={styles.cardTitle}>⏱ Time Outside Tab</div>
                        <div style={styles.cardSubtitle}>(HH:MM:SS)</div>
                        <div style={styles.cardValue}>{formatTime(totalBlurTime)}</div>
                    </div>
                    <div style={styles.card}>
                        <div style={styles.cardTitle}>🖱 Mouse Leaves</div>
                        <div style={styles.cardValue}>{hoverLeaveCount}</div>
                    </div>
                    <div style={styles.card}>
                        <div style={styles.cardTitle}>🕒 Time Mouse Outside</div>
                        <div style={styles.cardSubtitle}>(HH:MM:SS)</div>
                        <div style={styles.cardValue}>{formatTime(totalHoverLeaveTime)}</div>
                    </div>
                    <div style={styles.card}>
                        <div style={styles.cardTitle}>⌨ Suspicious Keypresses</div>
                        <div style={styles.cardValue}>{keypressCount}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FullscreenTracker;