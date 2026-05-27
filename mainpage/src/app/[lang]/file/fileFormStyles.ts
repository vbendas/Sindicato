/** Shared dropdown/panel styles for the /file form (charcoal + warm-white theme). */

export const fileDropdownContentClass =
  "rounded-none border-sindicato-warm-white/10 bg-sindicato-charcoal text-sindicato-warm-white ring-sindicato-warm-white/10 shadow-md [&_[data-slot=select-scroll-up-button]]:bg-sindicato-charcoal [&_[data-slot=select-scroll-down-button]]:bg-sindicato-charcoal";

export const fileDropdownCommandClass =
  "rounded-none! bg-sindicato-charcoal text-sindicato-warm-white [&_[data-slot=input-group]]:border-sindicato-warm-white/20 [&_[data-slot=input-group]]:bg-sindicato-warm-white/10 [&_[data-slot=input-group]]:shadow-none [&_[data-slot=input-group-addon]]:text-sindicato-warm-white/50";

export const fileDropdownItemClass =
  "text-sindicato-warm-white data-selected:bg-sindicato-warm-white/10 data-selected:text-sindicato-warm-white";

export const fileSelectItemClass =
  "rounded-none text-sindicato-warm-white hover:bg-sindicato-warm-white/10 hover:text-sindicato-warm-white focus:!bg-sindicato-warm-white/10 focus:!text-sindicato-warm-white data-[highlighted]:bg-sindicato-warm-white/10 data-[highlighted]:text-sindicato-warm-white focus:**:text-sindicato-warm-white!";

export const fileCalendarClass =
  "bg-sindicato-charcoal text-sindicato-warm-white [--cell-radius:0] p-3";

export const fileCalendarClassNames = {
  caption_label: "text-sindicato-warm-white font-[family-name:var(--font-barlow)]",
  weekday: "text-sindicato-warm-white/50",
  outside: "text-sindicato-warm-white/25 aria-selected:text-sindicato-warm-white/25",
  disabled: "text-sindicato-warm-white/25 opacity-50",
  today: "bg-sindicato-warm-white/10 text-sindicato-warm-white rounded-none",
  button_previous:
    "text-sindicato-warm-white hover:bg-sindicato-warm-white/10 hover:text-sindicato-warm-white",
  button_next:
    "text-sindicato-warm-white hover:bg-sindicato-warm-white/10 hover:text-sindicato-warm-white",
  range_start: "rounded-none bg-sindicato-warm-white/15",
  range_middle: "rounded-none bg-sindicato-warm-white/10",
  range_end: "rounded-none bg-sindicato-warm-white/15",
};

export const fileCalendarDayButtonClass =
  "text-sindicato-warm-white hover:bg-sindicato-warm-white/10 hover:text-sindicato-warm-white data-[range-middle=true]:bg-sindicato-warm-white/10 data-[range-middle=true]:text-sindicato-warm-white";
