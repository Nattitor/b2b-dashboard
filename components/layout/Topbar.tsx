import { Search, Bell, User } from "lucide-react";

export function Topbar() {
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 glass-panel border-b border-white/10 bg-[#0A0E17]/80 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form className="relative flex flex-1" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">
            Search
          </label>
          <Search
            className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-zinc-500"
            aria-hidden="true"
          />
          <input
            id="search-field"
            className="block h-full w-full border-0 bg-transparent py-0 pl-8 pr-0 text-white placeholder:text-zinc-500 focus:ring-0 sm:text-sm"
            placeholder="Search transactions..."
            type="search"
            name="search"
            disabled
          />
        </form>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-zinc-400 md:hover:text-white transition-colors active:scale-95"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-white/10" aria-hidden="true" />

          {/* Profile dropdown skeleton */}
          <div className="relative">
            <button
              type="button"
              className="-m-1.5 flex items-center p-1.5 active:scale-95 transition-transform"
            >
              <span className="sr-only">Open user menu</span>
              <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10">
                <User className="h-4 w-4 text-zinc-400" />
              </div>
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-4 text-sm font-semibold leading-6 text-white" aria-hidden="true">
                  Admin
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
