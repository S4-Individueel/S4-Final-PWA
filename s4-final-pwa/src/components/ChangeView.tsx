import {control, LatLng} from "leaflet";
import {useMap} from "react-leaflet";

export default function ChangeView({ center }: {center: location}) {
	const newCenter = new LatLng(center.latitude,  center.longitude)
	const zoom = 14;

	const map = useMap();
	map.setView(newCenter, zoom);
	return null;
}