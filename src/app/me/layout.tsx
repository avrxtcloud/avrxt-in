import type { Metadata } from "next";

export const metadata: Metadata = {
    icons: {
        icon: "https://camo.githubusercontent.com/870cfca3432cad5e7be3cb0bdb72a4492ac41a7c4e835a2ee34879164587a897/68747470733a2f2f63646e2e61767278742e696e2f6173736574732f6c6f676f2d30322e706e67",
    },
};

export default function MeLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <>{children}</>;
}
