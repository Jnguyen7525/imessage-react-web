import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import isToday from "dayjs/plugin/isToday";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

dayjs.extend(weekday);
dayjs.extend(isToday);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export default function CalendarView() {
  const [startDate, setStartDate] = useState(dayjs());
  const [showMiniCalendar, setShowMiniCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(
    startDate.startOf("month")
  );

  const startOfWeek = startDate.startOf("week");
  const days = Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, "day"));
  const hours = Array.from({ length: 24 }, (_, i) =>
    dayjs().hour(i).format("ha")
  );

  const handlePrev = () => setStartDate((prev) => prev.subtract(7, "day"));
  const handleNext = () => setStartDate((prev) => prev.add(7, "day"));

  return (
    <div className="flex flex-col flex-1 h-full w-full bg-gradient-to-t from-slate-800 to-slate-950 text-white relative">
      {/* Controls */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700 bg-gradient-to-t from-slate-800 to-slate-950 relative">
        <div className="flex gap-2 items-center">
          <button
            onClick={handlePrev}
            className="p-1 rounded hover:opacity-50 cursor-pointer"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={handleNext}
            className="p-1 rounded hover:opacity-50 cursor-pointer"
          >
            <ChevronRight />
          </button>

          {/* Month/Year Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMiniCalendar((prev) => !prev)}
              className="flex items-center gap-1 font-semibold hover:opacity-50 cursor-pointer"
            >
              <span>{startDate.format("MMMM YYYY")}</span>
              <ChevronDown size={16} />
            </button>

            {showMiniCalendar && (
              <div className="absolute top-full mt-2 bg-slate-900 border border-slate-700 rounded shadow-lg z-10 p-4 w-72">
                {/* Mini Calendar Header */}
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-sm">
                    {calendarMonth.format("MMMM YYYY")}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setCalendarMonth((prev) => prev.subtract(1, "month"))
                      }
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() =>
                        setCalendarMonth((prev) => prev.add(1, "month"))
                      }
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 text-xs text-center text-gray-400 mb-2">
                  {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                    <div key={i}>{d}</div>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 text-center text-sm">
                  {Array.from({
                    length:
                      calendarMonth.daysInMonth() +
                      calendarMonth.startOf("month").day(),
                  }).map((_, i) => {
                    const day = calendarMonth
                      .startOf("month")
                      .startOf("week")
                      .add(i, "day");
                    const isCurrentMonth =
                      day.month() === calendarMonth.month();
                    const isToday = day.isToday();
                    const isCurrentWeek = day.isSame(startDate, "week");

                    return (
                      <button
                        key={day.format("YYYY-MM-DD")}
                        onClick={() => {
                          setStartDate(day.startOf("week"));
                          setShowMiniCalendar(false);
                        }}
                        className={` flex items-center justify-center p-2 ${
                          isToday
                            ? "bg-blue-500 rounded-full text-white"
                            : isCurrentWeek
                            ? "bg-blue-900 text-white"
                            : isCurrentMonth
                            ? "text-white hover:bg-slate-800"
                            : "text-gray-500"
                        }`}
                      >
                        {day.date()}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Header: Days of Week */}
      <div className="grid grid-cols-[80px_repeat(7,minmax(0,1fr))] border-b border-slate-700">
        <div className="bg-slate-900 p-2 text-sm font-semibold flex items-center justify-center">
          Time
        </div>
        {days.map((day) => (
          <div
            key={day.format("YYYY-MM-DD")}
            className="p-2 text-sm font-semibold text-center"
          >
            {day.format("ddd DD")}
          </div>
        ))}
      </div>

      {/* Body: Time Rows */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {hours.map((hour) => (
          <div
            key={hour}
            className="grid grid-cols-[80px_repeat(7,minmax(0,1fr))] border-b border-slate-700 h-16"
          >
            <div className="flex items-center justify-center text-xs text-gray-400 bg-slate-950">
              {hour}
            </div>
            {days.map((day) => (
              <div
                key={`${day.format("YYYY-MM-DD")}-${hour}`}
                className="border-l border-slate-800 hover:bg-slate-800 cursor-pointer p-1 flex"
              >
                <textarea
                  placeholder=""
                  className="w-full h-full resize-none bg-transparent text-white text-xs outline-none"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
