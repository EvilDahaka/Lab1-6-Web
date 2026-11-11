
import type { ReactNode } from 'react';

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  const currentTab = tabs.find((tab) => tab.id === activeTab);

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div
        className="flex flex-wrap gap-2 border-b border-gray-200"
        role="tablist"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`border-b-2 px-4 py-3 text-sm font-medium transition ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="py-4">
        {currentTab?.content}
      </div>
    </div>
  );
}

export default Tabs;
