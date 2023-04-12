import dynamic from "next/dynamic";

const Main = dynamic(() => import("../components/main/index"), { ssr: false });


export default function Home() {
	return (
		<Main />
	)
}
