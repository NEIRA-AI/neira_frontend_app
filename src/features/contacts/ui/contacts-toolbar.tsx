import { Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Input } from "@/shared/ui/input";

type ContactsToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
};

export function ContactsToolbar({
  search,
  onSearchChange,
}: ContactsToolbarProps) {
  const { t } = useTranslation("contacts");

  return (
    <div className="flex flex-col gap-4 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <h2 className="text-base font-semibold text-ink">{t("allContacts")}</h2>
      <div className="relative w-full sm:max-w-sm">
        <label className="sr-only" htmlFor="contacts-search">
          {t("searchLabel")}
        </label>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted"
        />
        <Input
          autoComplete="off"
          className="min-h-10 pr-10 pl-11 [&::-webkit-search-cancel-button]:hidden"
          id="contacts-search"
          maxLength={120}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t("searchPlaceholder")}
          type="search"
          value={search}
        />
        {search && (
          <button
            aria-label={t("clearSearch")}
            className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted hover:bg-subtle hover:text-ink focus-visible:outline-2 focus-visible:outline-brand"
            onClick={() => onSearchChange("")}
            type="button"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
