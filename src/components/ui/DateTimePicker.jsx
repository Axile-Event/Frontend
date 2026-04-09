"use client";
import React, { forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, Clock } from "lucide-react";

// Custom input component for the datepicker
const CustomInput = forwardRef(({ value, onClick, placeholder, hasError }, ref) => (
  <button
    type="button"
    onClick={onClick}
    ref={ref}
    className={`w-full flex items-center gap-3 bg-white/5 border ${
      hasError ? "border-rose-500/50" : "border-white/10"
    } rounded-xl px-4 py-3 text-sm text-left text-white placeholder-gray-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all hover:border-white/20`}
  >
    <Calendar className="w-4 h-4 text-gray-500 shrink-0" />
    <span className={value ? "text-white" : "text-gray-600"}>
      {value || placeholder || "Select date and time"}
    </span>
    <Clock className="w-4 h-4 text-gray-500 ml-auto shrink-0" />
  </button>
));

CustomInput.displayName = "CustomInput";

export default function DateTimePicker({ 
  selected, 
  onChange, 
  placeholder = "Select date and time",
  hasError = false,
  minDate = new Date(),
  ...props 
}) {
  // Convert string to Date if needed
  const selectedDate = selected ? (typeof selected === 'string' ? new Date(selected) : selected) : null;

  const handleChange = (date) => {
    if (date) {
      // Format as ISO string for datetime-local compatibility
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
      onChange(formattedDate);
    } else {
      onChange('');
    }
  };

  return (
    <DatePicker
      selected={selectedDate}
      onChange={handleChange}
      showTimeSelect
      timeFormat="h:mm aa"
      timeIntervals={15}
      dateFormat="MMMM d, yyyy h:mmaa"
      minDate={minDate}
      placeholderText={placeholder}
      customInput={<CustomInput hasError={hasError} placeholder={placeholder} />}
      popperClassName="react-datepicker-dark"
      calendarClassName="react-datepicker-dark-calendar"
      wrapperClassName="w-full"
      {...props}
    />
  );
}
