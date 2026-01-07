import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { ConversationsPanel } from "@/components/chat/ConversationsPanel";
import { ProductsPanel } from "@/components/products/ProductsPanel";
import { LiveChatPanel } from "@/components/live/LiveChatPanel";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview />;
      case "chats":
        return <ConversationsPanel />;
      case "products":
        return <ProductsPanel />;
      case "live":
        return <LiveChatPanel />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
