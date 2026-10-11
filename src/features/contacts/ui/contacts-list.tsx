import { MessageSquareText, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { channelProviders } from "@/features/channels";
import {
  contactDetailsPath,
  messageConversationPath,
} from "@/shared/config/routes";

import type { ContactSummary } from "../api/contacts-api";

import { ContactAvatar } from "./contact-avatar";

type ContactConversation = {
  provider: string;
  conversation_id: string | null;
  identity_id?: string;
};

type ContactListItem = ContactSummary;

function providerLabel(provider: string, telegram: string, vk: string) {
  if (provider === "telegram_bot") return telegram;
  if (provider === "vk_community") return vk;
  return provider;
}

function ContactChannelIcons({ contact }: { contact: ContactListItem }) {
  const { t } = useTranslation("contacts");
  const channels: ContactConversation[] = contact.conversations.length
    ? contact.conversations
    : contact.providers.map((provider) => ({
        provider,
        conversation_id: null,
      }));

  if (channels.length === 0) {
    return <span className="text-sm text-muted">{t("noValue")}</span>;
  }

  return (
    <span className="flex flex-wrap items-center gap-1">
      {channels.map((channel, index) => {
        const provider = channelProviders.find(
          (item) => item.id === channel.provider,
        );
        const label = providerLabel(
          channel.provider,
          t("telegramProvider"),
          t("vkProvider"),
        );
        const icon = provider ? (
          <img alt="" className="size-5 object-contain" src={provider.icon} />
        ) : (
          <MessageSquareText aria-hidden="true" className="size-5" />
        );
        const linkClassName =
          "grid size-9 place-items-center rounded-lg text-muted transition-colors hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand";
        const key = `${channel.provider}-${channel.conversation_id ?? channel.identity_id ?? index}`;

        return channel.conversation_id ? (
          <Link
            aria-label={t("openChannelConversation", {
              channel: label,
              name: contact.display_name,
            })}
            className={linkClassName}
            key={key}
            title={label}
            to={messageConversationPath(channel.conversation_id)}
          >
            {icon}
          </Link>
        ) : (
          <span
            aria-label={label}
            className="grid size-9 place-items-center text-muted"
            key={key}
            role="img"
            title={label}
          >
            {icon}
          </span>
        );
      })}
    </span>
  );
}

function ContactActions({
  contact,
  onEdit,
  onDelete,
}: {
  contact: ContactListItem;
  onEdit: (contact: ContactListItem) => void;
  onDelete: (contact: ContactListItem) => void;
}) {
  const { t } = useTranslation("contacts");

  return (
    <span className="flex items-center gap-1">
      <button
        aria-label={t("editContact", { name: contact.display_name })}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-ink transition-colors hover:bg-subtle focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand"
        onClick={() => onEdit(contact)}
        type="button"
      >
        <Pencil aria-hidden="true" className="size-4" />
        {t("edit")}
      </button>
      <button
        aria-label={t("deleteContact", { name: contact.display_name })}
        className="grid size-9 place-items-center rounded-lg text-muted transition-colors hover:bg-danger-soft hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand"
        onClick={() => onDelete(contact)}
        type="button"
      >
        <Trash2 aria-hidden="true" className="size-4" />
      </button>
    </span>
  );
}

export function ContactsList({
  contacts,
  canManage,
  onEdit,
  onDelete,
}: {
  contacts: ContactListItem[];
  canManage: boolean;
  onEdit: (contact: ContactListItem) => void;
  onDelete: (contact: ContactListItem) => void;
}) {
  const { t, i18n } = useTranslation("contacts");
  const dateTimeFormat = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const dateFormat = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: "medium",
  });

  return (
    <>
      <ul className="divide-y divide-line lg:hidden">
        {contacts.map((contact) => (
          <li className="px-5 py-4 sm:px-6" key={contact.id}>
            <div className="flex min-w-0 items-center gap-3">
              <ContactAvatar
                language={i18n.language}
                name={contact.display_name}
                url={contact.avatar_url}
              />
              <Link
                aria-label={t("openContact", { name: contact.display_name })}
                className="min-w-0 flex-1 truncate rounded-lg text-sm font-semibold text-ink hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-brand"
                to={contactDetailsPath(contact.id)}
              >
                {contact.display_name}
              </Link>
              <ContactChannelIcons contact={contact} />
            </div>
            <dl className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 pl-13 text-xs">
              <dt className="text-muted">{t("email")}</dt>
              <dd className="min-w-0 break-all text-muted-strong">
                {contact.email || t("noValue")}
              </dd>
              <dt className="text-muted">{t("phone")}</dt>
              <dd className="text-muted-strong">
                {contact.phone || t("noValue")}
              </dd>
              <dt className="text-muted">{t("lastActivity")}</dt>
              <dd className="text-muted-strong">
                {contact.last_seen_at
                  ? dateTimeFormat.format(new Date(contact.last_seen_at))
                  : t("noValue")}
              </dd>
              <dt className="text-muted">{t("createdAt")}</dt>
              <dd className="text-muted-strong">
                {dateFormat.format(new Date(contact.created_at))}
              </dd>
            </dl>
            {canManage && (
              <div className="mt-3 flex justify-end pl-13">
                <ContactActions
                  contact={contact}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              </div>
            )}
          </li>
        ))}
      </ul>

      <div
        aria-label={t("allContacts")}
        className="hidden overflow-x-auto lg:block"
        role="region"
        tabIndex={0}
      >
        <table className="w-full min-w-[1200px] border-collapse text-left">
          <thead className="bg-subtle/40">
            <tr className="border-b border-line text-xs text-muted">
              <th className="px-6 py-3 font-medium" scope="col">
                {t("contact")}
              </th>
              <th className="px-3 py-3 font-medium" scope="col">
                {t("channels")}
              </th>
              <th className="px-4 py-3 font-medium" scope="col">
                {t("email")}
              </th>
              <th className="px-4 py-3 font-medium" scope="col">
                {t("phone")}
              </th>
              <th className="px-4 py-3 font-medium" scope="col">
                {t("lastActivity")}
              </th>
              <th className="px-4 py-3 font-medium" scope="col">
                {t("createdAt")}
              </th>
              {canManage && (
                <th className="px-6 py-3 font-medium" scope="col">
                  {t("actions")}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr
                className="h-17 border-b border-line last:border-0"
                key={contact.id}
              >
                <td className="max-w-60 px-6 py-3">
                  <Link
                    aria-label={t("openContact", {
                      name: contact.display_name,
                    })}
                    className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    to={contactDetailsPath(contact.id)}
                  >
                    <ContactAvatar
                      language={i18n.language}
                      name={contact.display_name}
                      url={contact.avatar_url}
                    />
                    <span className="min-w-0 truncate text-sm font-semibold text-ink hover:text-brand-strong">
                      {contact.display_name}
                    </span>
                  </Link>
                </td>
                <td className="px-3 py-3">
                  <ContactChannelIcons contact={contact} />
                </td>
                <td className="max-w-50 truncate px-4 py-3 text-sm text-muted-strong">
                  {contact.email || t("noValue")}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-strong">
                  {contact.phone || t("noValue")}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-strong">
                  {contact.last_seen_at
                    ? dateTimeFormat.format(new Date(contact.last_seen_at))
                    : t("noValue")}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-strong">
                  {dateFormat.format(new Date(contact.created_at))}
                </td>
                {canManage && (
                  <td className="px-6 py-3">
                    <ContactActions
                      contact={contact}
                      onDelete={onDelete}
                      onEdit={onEdit}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
