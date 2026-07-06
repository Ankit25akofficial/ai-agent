import React from 'react';
import { GooeyInput } from './ui/gooey-input';

interface SearchBarProps {
  onSearch: (companyName: string) => void;
  isLoading: boolean;
}

const SearchBar = ({ onSearch, isLoading }: SearchBarProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto flex justify-center py-2">
      <GooeyInput
        placeholder="Search company (e.g., Tesla, Nvidia, Apple)..."
        disabled={isLoading}
        collapsedWidth={180}
        expandedWidth={480}
        expandedOffset={0}
        onSubmit={onSearch}
        classNames={{
          root: "w-full flex justify-center",
          trigger: "bg-darkCard text-slate-100 hover:bg-slate-800/80 border border-darkBorder rounded-full shadow-lg ring-0 font-medium focus-visible:ring-indigo-500 px-5 py-3 h-12",
          bubbleSurface: "bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white border border-indigo-400/50 shadow-indigo-500/20",
          input: "text-slate-200 placeholder:text-slate-500 bg-transparent h-full",
        }}
      />
    </div>
  );
};

export default SearchBar;
