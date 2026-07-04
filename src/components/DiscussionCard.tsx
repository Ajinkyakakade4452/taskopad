import React, { useState } from 'react';
import { MessageSquare, Send, ThumbsUp, CalendarClock } from 'lucide-react';
import { DiscussionMessage } from '../types';

interface DiscussionCardProps {
  theme: 'dark' | 'light';
}

const mockDiscussions: DiscussionMessage[] = [
  {
    id: 'disc-1',
    userName: 'Krishna Lokhande',
    userInitials: 'KL',
    avatarColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    date: '1 Jul 2026, 10:15 AM',
    message: 'Can everyone review the design mockups for the Om Associates website? The high-priority batch ends today.',
    category: 'General',
  },
  {
    id: 'disc-2',
    userName: 'Alister Manikam',
    userInitials: 'AM',
    avatarColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    date: '1 Jul 2026, 09:30 AM',
    message: 'Drafting the 5 stories for YouGo now. Let me know if we need a specific hashtag alignment.',
    category: 'Task',
  },
  {
    id: 'disc-3',
    userName: 'Kriti Khandelwal',
    userInitials: 'KK',
    avatarColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    date: '30 Jun 2026, 05:45 PM',
    message: 'Finished sending the evening lead batch. All spreadsheets are updated on Google Drive.',
    category: 'Task',
  },
  {
    id: 'disc-4',
    userName: 'Aditya Kirat Karve',
    userInitials: 'AK',
    avatarColor: 'bg-red-500/20 text-red-400 border-red-500/30',
    date: '30 Jun 2026, 02:20 PM',
    message: 'Server migration for Net Access Internet is scheduled for this coming Saturday night to avoid customer downtime.',
    category: 'General',
  },
];

export default function DiscussionCard({ theme }: DiscussionCardProps) {
  const [activeTab, setActiveTab] = useState<'General' | 'Task'>('General');
  const [messages, setMessages] = useState<DiscussionMessage[]>(mockDiscussions);
  const [newMsgText, setNewMsgText] = useState('');

  const filteredMessages = messages.filter((m) => m.category === activeTab);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgText.trim()) return;

    const newMessage: DiscussionMessage = {
      id: `disc-${Date.now()}`,
      userName: 'Krishna Lokhande',
      userInitials: 'KL',
      avatarColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      date: '1 Jul 2026, Just Now',
      message: newMsgText,
      category: activeTab,
    };

    setMessages([newMessage, ...messages]);
    setNewMsgText('');
  };

  return (
    <div
      id="discussion-section"
      className={`rounded-2xl p-6 transition-all duration-300 shadow-lg border h-full flex flex-col justify-between ${
        theme === 'dark'
          ? 'bg-[#141C38] border-slate-800 text-slate-200'
          : 'bg-white border-slate-100 text-slate-800'
      }`}
    >
      <div>
        {/* Header and Tabs */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4.5 h-4.5 text-cyan-400" />
            <h3 className="font-semibold text-base tracking-tight">Recent Discussion</h3>
          </div>

          {/* Discussion Tabs (General, Task) */}
          <div className={`p-1 rounded-lg flex items-center ${theme === 'dark' ? 'bg-[#0D1631]' : 'bg-slate-100'}`}>
            {(['General', 'Task'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-[10px] uppercase tracking-wider font-extrabold px-3 py-1.5 rounded-md transition ${
                  activeTab === tab
                    ? theme === 'dark'
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-cyan-500 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Message feed */}
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
          {filteredMessages.length > 0 ? (
            filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-xl border flex flex-col gap-2 transition ${
                  theme === 'dark'
                    ? 'bg-[#0D1631] border-slate-800/80 hover:border-slate-700'
                    : 'bg-slate-50 border-slate-150 hover:border-slate-200'
                }`}
              >
                {/* Meta details */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-800/10 pb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6.5 h-6.5 rounded-lg border font-bold text-[9px] flex items-center justify-center select-none ${msg.avatarColor}`}
                    >
                      {msg.userInitials}
                    </div>
                    <span className="text-[11px] font-bold truncate leading-none">
                      {msg.userName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-slate-400 font-medium font-mono">
                    <CalendarClock className="w-3 h-3 text-cyan-500" />
                    <span>{msg.date}</span>
                  </div>
                </div>

                {/* Message text */}
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  {msg.message}
                </p>

                {/* Quick actions inside message */}
                <div className="flex items-center gap-3.5 pt-1 text-[10px] text-slate-400 select-none">
                  <button className="flex items-center gap-1 hover:text-cyan-400 transition cursor-pointer">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Like</span>
                  </button>
                  <span>•</span>
                  <button className="hover:text-cyan-400 transition cursor-pointer">
                    Reply Thread
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-xs text-slate-500">
              No discussions in #{activeTab} yet.
            </div>
          )}
        </div>
      </div>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="mt-4 pt-3 border-t border-slate-800/10 flex gap-2">
        <input
          type="text"
          placeholder={`Add comments to #${activeTab}...`}
          value={newMsgText}
          onChange={(e) => setNewMsgText(e.target.value)}
          className={`flex-1 text-xs px-3.5 py-2 rounded-xl border outline-none transition focus:ring-2 focus:ring-cyan-400 ${
            theme === 'dark'
              ? 'bg-[#0D1631] border-slate-700 text-slate-100 placeholder-slate-400'
              : 'bg-slate-50 border-slate-200 text-slate-700 placeholder-slate-400'
          }`}
        />
        <button
          type="submit"
          className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition flex items-center justify-center cursor-pointer shadow-md shadow-cyan-500/10 active:scale-95"
        >
          <Send className="w-4 h-4 text-slate-950 stroke-[2.5]" />
        </button>
      </form>
    </div>
  );
}
