'use client';
import dynamic from "next/dynamic";
import {useEffect, useRef, useState} from "react";
import Head from "next/head";
import styles from "@/styles/Home.module.css"


const Map = dynamic(() => import("../components/map/Map"), { ssr: false });

interface MessageProps {
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

export default function Home() {
	const [messages, setMessages] = useState<MessageProps[]>([]);
	const messagesRef = useRef<MessageProps[]>([]);
	const [loading, setLoading] = useState(false);
	const [location, setLocation] = useState<location>();

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
	})

	const callApi = async (input: string) => {
		setLoading(true);

		const response = await fetch("/api/generate-answer", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				prompt: `Give me recommendations for when im visiting ${input}`
			})
		}).then((response) => response.json())
		setLoading(false)

		if (response.text)  {
			const botMessage: MessageProps = {
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
					<Map center={location!} zoom={13} />
					<ChatInput onSend={(input) => callApi(input)} disabled={loading} />
				</div>
				<div className={styles.chat}>
					<h2>AI recommendations</h2>

					{messages.map((msg: MessageProps) => (
						<div key={msg.key} className={styles.chatBubble}>
							<p>{msg.text}</p>
						</div>
					))}
					{messages.length == 0 && <p>At your service!</p> }
				</div>
			</div>
		</>
	)
}
