import React, { useState } from 'react';
import { ReactComponent as TelegramIcon } from '~/public/images/vip/telegram.svg';
import { ReactComponent as WhatsAppIcon } from '~/public/images/vip/whatsapp.svg';
import type { ContactMethod } from './constants';

const CONTACT_OPTIONS: {
  value: ContactMethod;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  label: string;
}[] = [
  { value: 'telegram', Icon: TelegramIcon, label: 'Telegram' },
  { value: 'whatsapp', Icon: WhatsAppIcon, label: 'WhatsApp' }
];

interface ContactMethodDropdownProps {
  value: ContactMethod;
  onChange: (value: ContactMethod) => void;
}

const ContactMethodDropdown: React.FC<ContactMethodDropdownProps> = ({
  value,
  onChange
}) => {
  const [open, setOpen] = useState(false);
  const selected =
    CONTACT_OPTIONS.find((option) => option.value === value) ||
    CONTACT_OPTIONS[0];

  const handleSelect = (nextValue: ContactMethod) => {
    onChange(nextValue);
    setOpen(false);
  };

  return (
    <div className="relative w-full md:w-[160px]">
      <div
        className="w-full h-[40px] bg-fill-input rounded-lg flex items-center justify-between px-3 cursor-pointer"
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className="flex items-center gap-2">
          <selected.Icon className="w-5 h-5" />
          <span className="text-sm">{selected.label}</span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
      {open && (
        <div className="absolute top-[44px] left-0 w-full bg-fill-input rounded-lg shadow-lg border border-line-border-default z-10">
          {CONTACT_OPTIONS.map(({ value: optionValue, Icon, label }) => (
            <div
              key={optionValue}
              className="flex justify-between items-center gap-2 px-3 py-2 hover:bg-fill-hover cursor-pointer"
              onClick={() => handleSelect(optionValue)}
            >
              <div className="flex items-center justify-start gap-2">
                <Icon className="w-5 h-5" />
                <span
                  className={`text-sm ${
                    optionValue === value ? 'text-text-brand-default' : ''
                  }`}
                >
                  {label}
                </span>
              </div>
              {optionValue === value && (
                <svg
                  className="w-4 h-4 text-text-brand-default shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M2.6665 7.70515L6.22206 11.2607L13.3332 4.74219"
                    stroke="#ABE127"
                    strokeWidth="2.33499"
                  />
                </svg>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactMethodDropdown;
