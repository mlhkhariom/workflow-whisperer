import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { ConversationsPanel } from "@/components/chat/ConversationsPanel";
import { ProductsPanel } from "@/components/products/ProductsPanel";
import { ProductImagesPanel } from "@/components/images/ProductImagesPanel";
import { LiveChatPanel } from "@/components/live/LiveChatPanel";
import { Heart } from "lucide-react";

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
      case "images":
        return <ProductImagesPanel />;
      case "live":
        return <LiveChatPanel />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
        {/* Mobile top padding for fixed header */}
        <div className="h-14 md:hidden shrink-0" />
        
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
        
        <footer className="py-3 px-4 sm:px-6 border-t border-border bg-card/50 backdrop-blur-sm shrink-0">
          <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1 flex-wrap">
            Build With <Heart className="w-3 h-3 text-destructive fill-destructive" /> By MLHK Infotech (Hariom Vishwkarma)
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
