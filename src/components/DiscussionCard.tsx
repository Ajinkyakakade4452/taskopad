import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, ThumbsUp, CalendarClock, Loader2 } from 'lucide-react';
import { DiscussionMessage } from '../types';

interface DiscussionCardProps {
  theme: 'dark' | 'light';
}

const API_BASE = '/api';

export default function DiscussionCard({ theme }: DiscussionCardProps) {
  const [activeTab, setActiveTab] = useState<'General' | 'Task'>('General');
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [newMsgText, setNewMsgText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const fetchDiscussions = async () => {
    try {
      const res = await fetch(`${API_BASE}/discussions`);
      if (res.ok) {
        const data = await res.json();
        // Sort by ID or date if needed. Assuming newer is at the end, we reverse it to show newest at top if needed.
        // Actually, backend returns as stored. Let's just set it.
        setMessages(data.reverse());
      }
    } catch (err) {
      console.error('Failed to fetch discussions', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = messages.filter((m) => m.category === activeTab);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgText.trim()) return;

    // Get current user details from sessionStorage if available
    let userName = 'Unknown User';
    let userInitials = 'UU';
    let avatarColor = 'bg-slate-500/20 text-slate-400 border-slate-500/30';

    try {
      const saved = sessionStorage.getItem('taskpad_user');
      if (saved) {
        const user = JSON.parse(saved);
        userName = user.name;
        userInitials = user.initials;
        avatarColor = `bg-[${user.avatarColor}] text-white`; // Simplified for now
      }
    } catch {}

    const newMessage = {
      userName,
      userInitials,
      avatarColor,
      date: new Date().toLocaleDateString('en-IN') + ', ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      message: newMsgText,
      category: activeTab,
    };

    try {
      const res = await fetch(`${API_BASE}/discussions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage),
      });

      if (res.ok) {
        const savedMsg = await res.json();
        setMessages([savedMsg, ...messages]);
        setNewMsgText('');
      }
    } catch (err) {
      console.error('Failed to post discussion', err);
    }
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
          {loading ? (
            <div className="py-12 flex items-center justify-center text-xs text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Loading discussions...
            </div>
          ) : filteredMessages.length > 0 ? (
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
                      className={`w-6.5 h-6.5 rounded-lg border font-bold text-[9px] flex items-center justify-center select-none ${
                        msg.avatarColor && msg.avatarColor.includes('bg-[') ? 'bg-cyan-500 text-white' : msg.avatarColor
                      }`}
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
