interface Contact {
  id: string;
  name: string;
  avatar?: string;
}

interface ContactEntry {
  contact: Contact;
  chat_id: string;
}

interface ContactsPanelProps {
  contacts: ContactEntry[];
  unreadCounts: Record<string, number>;
  handleSelectContact: (contact: Contact) => Promise<void>; // ← make it async
}

export default function ContactsPanel({
  contacts,
  unreadCounts,
  handleSelectContact,
}: ContactsPanelProps) {
  return (
    <div className="w-[250px] bg-slate-950 text-white flex flex-col border-r border-slate-600 gap-5">
      <div className="flex-1 overflow-y-auto scrollbar-hide mt-10 gap-5 pl-5 flex flex-col">
        {contacts.map(({ contact, chat_id }) => (
          <button
            key={contact.id}
            className="flex items-center gap-2 w-full hover:opacity-50 rounded cursor-pointer"
            onClick={() => handleSelectContact(contact)}
          >
            {contact.avatar ? (
              <img
                src={contact.avatar}
                alt={contact.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold">
                {contact.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="flex gap-1 items-center">
              <span className="">{contact.name}</span>
              {unreadCounts[chat_id] > 0 && (
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCounts[chat_id]}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
