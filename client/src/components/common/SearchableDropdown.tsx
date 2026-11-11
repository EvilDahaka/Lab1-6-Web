
import { useState } from 'react';

export interface DropdownOption {
  value: string;
  label: string;
}

interface SearchableDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
}

function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder = 'Оберіть варіант',
  searchPlaceholder = 'Пошук...',
  disabled = false,
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedOption = options.find(
    (option) => option.value === value
  );

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (option: DropdownOption) => {
    onChange(option.value);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((previous) => !previous)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-left text-sm text-gray-700 shadow-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
      >
        <span>
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <span className="ml-2 text-gray-400">
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={searchPlaceholder}
            autoFocus
            className="w-full rounded-t-lg border-b border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          />

          <ul className="max-h-52 overflow-y-auto py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-blue-50 ${
                      option.value === value
                        ? 'bg-blue-50 font-medium text-blue-700'
                        : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-sm text-gray-500">
                Нічого не знайдено
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SearchableDropdown;
