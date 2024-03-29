'use client';
import {useEffect, useRef, useState} from "react";
import Head from "next/head";
import styles from "@/styles/Home.module.css"
import {OpenStreetMapProvider} from "leaflet-geosearch";
import {LatLng} from "leaflet";
import ChangeView from "@/components/ChangeView";
import {MapContainer, Marker, Popup, TileLayer} from "react-leaflet";
import classNames from "classnames";

interface MessageProps {
    location: string
    text: string,
    key: number
}

interface InputProps {
    onSend: (input: string) => void;
    disabled: boolean
}

const ChatInput = ({onSend, disabled}: InputProps) => {
    const [input, setInput] = useState("");

    const sendInput = () => {
        onSend(input);
        setInput("")
    }

    const handleKeyDown = (event: any) => {
        if (event.keyCode === 13) {
            sendInput()
        }
    }

    return (
        <div>
            <input
                className={styles.search}
                value={input}
                onChange={(ev: any) => setInput(ev.target.value)}
                type={"text"}
                placeholder={"Ask me anything"}
                disabled={disabled}
                onKeyDown={(ev) => handleKeyDown(ev)}
            />
        </div>
    )
}

interface PropTypes {
    center: location;
    zoom: number;
}

const Map = ({ center, zoom }: PropTypes) => {
    const newCenter = new LatLng(center.latitude, center.longitude);
    const [location, setLocation] = useState<LatLng | null>(newCenter);

    useEffect(() => {
        setLocation(newCenter)
    }, [center])


    return (
        <MapContainer
            className={styles.map}
            center={location!}
            zoom={zoom}
            scrollWheelZoom={true}
        >
            <ChangeView center={{ latitude: Number(location?.lat), longitude: Number(location?.lng) }} />
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {location && (
                <Marker position={location}>
                    <Popup>{location.toString()}</Popup>
                </Marker>
            )}
        </MapContainer>
    );
}

export default function Home() {
    const [messages, setMessages] = useState<MessageProps[]>([]);
    const messagesRef = useRef<MessageProps[]>([]);
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState<location>();
    const [locationName, setLocationName] = useState<string>("");
    const [open, setOpen] = useState(false)

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(({ coords }) => {
                    const { latitude, longitude } = coords;
                    setLocation({latitude, longitude})
                });
            }
        }
    }, [])

    useEffect(() => {
        if (locationName != "") {
            callApi().then(() => {
                return
            })
        }
    }, [locationName])

    const callApi = async () => {
        setLoading(true);

        const response = await fetch("/api/generate-answer", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                prompt: `Give me a list of 3 recommendations for when im visiting ${locationName}. Give me this list with bullet points •.`
            })
        }).then((response) => response.json())
        setLoading(false)

        if (response.text)  {
            const botMessage: MessageProps = {
                location: locationName,
                text: response.text,
                key: new Date().getTime()
            };
            setMessages([...messagesRef.current, botMessage])
        }
    }

    return (
        <>
            <Head>
                <link rel="stylesheet" href="https://unpkg.com/leaflet@1.0.1/dist/leaflet.css" />
            </Head>
            <div className={styles.container}>
                <div className={styles.map}>
                    {
                        location && <Map center={location!} zoom={13} />
                    }
                    <ChatInput onSend={(input) => {
                        const provider = new OpenStreetMapProvider();
                        provider.search({ query: input }).then((results) => {
                            if (results.length !== 0) {
                                setLocationName(results[0].label)
                                const search = new LatLng(results[0].y, results[0].x);
                                setLocation({
                                    latitude: search.lat,
                                    longitude: search.lng
                                });
                            }
                            else {
                                alert("Location not found")
                            }
                        });
                    }} disabled={loading} />
                </div>
                <div className={classNames(styles.chat, open && styles.open)}>
                    <h2>AI recommendations</h2>
                    {messages.length == 0 && <p>At your service!</p> }
                    {
                        loading && <img className={styles.loading} src="/loading-gif.gif" alt="Loading gif"/>
                    }
                    {messages.slice(0).reverse().map((msg: MessageProps) => (
                        <div key={msg.key} className={styles.chatBubble}>
                            <h2>{msg.location}</h2>
                            {msg.text.split("•").slice(1).map((m: string, index: number) => (
                                <li key={index} style={{marginBottom: "10px"}}>{m}</li>
                            ))}
                        </div>
                    ))}
                </div>

                <div className={styles.bubble} onClick={() => {
                    if (!open) {
                        setOpen(true)
                    } else {
                        setOpen(false)
                    }
                }}>
                    <img className={styles.icon} src="/chat.svg" alt="Chat icon"/>
                </div>
            </div>
        </>
    )
}
