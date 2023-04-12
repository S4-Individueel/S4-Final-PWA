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

function Map({ center, zoom }: PropTypes) {
	const newCenter = new LatLng(center.latitude, center.longitude);
	const [location, setLocation] = useState<LatLng | null>(newCenter);

	useEffect(() => {
		console.log(location)
	})

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
					<Popup>{location.toString()}</Popup>
				</Marker>
			)}
		</MapContainer>
	);
}
