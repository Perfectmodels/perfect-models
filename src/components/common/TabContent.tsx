
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface TabItem {
  value: string;
  label: string;
  content: React.ReactNode;
}

interface TabContentProps {
  tabs: TabItem[];
  defaultValue?: string;
}

const TabContent: React.FC<TabContentProps> = ({ tabs, defaultValue }) => {
  return (
    <Tabs defaultValue={defaultValue || tabs[0].value} className="w-full">
      <div className="flex justify-center mb-8">
        <TabsList className="bg-transparent">
          {tabs.map((tab) => (
            <TabsTrigger 
              key={tab.value} 
              value={tab.value}
              className="px-8 py-2 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-model-gold data-[state=active]:text-model-gold data-[state=active]:shadow-none rounded-none"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="mt-6">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default TabContent;
