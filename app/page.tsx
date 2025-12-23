import { redirect } from "next/navigation";

export default function Home() {
    redirect("/dashboard/oee");
    return <>Coming Soon</>;
}