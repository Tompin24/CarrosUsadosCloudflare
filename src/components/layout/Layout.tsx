import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Chatbot } from "@/components/chat/Chatbot";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <Chatbot />
    </div>
  );
};
