import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { LatLng } from "leaflet";
import styles from "./map.module.css";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import {useState, useEffect, useRef} from "react";
import ChangeView from "../ChangeView";

interface PropTypes {
	center: location;
	zoom: number;
}

export default function Map({ center, zoom }: PropTypes) {
	const newCenter = new LatLng(center.latitude, center.longitude);
	const [location, setLocation] = useState<LatLng | null>(newCenter);

	const handleKeyDown = (e: any) => {
		if (e.key === "Enter") {
			const provider = new OpenStreetMapProvider();
			provider.search({ query: e.target.value }).then((results) => {
				if (results.length !== 0) {
					const search = new LatLng(results[0].y, results[0].x);
					setLocation(search);
				}
			});
		}
	};



	return (
		<MapContainer
			className={styles.map}
			center={newCenter}
			zoom={zoom}
			scrollWheelZoom={true}
		>
			<ChangeView center={{ latitude: Number(location?.lat), longitude: Number(location?.lng) }} />
			<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
			{location && (
				<Marker position={location}>
					<Popup>{location}</Popup>
				</Marker>
			)}
		</MapContainer>
	);
}
