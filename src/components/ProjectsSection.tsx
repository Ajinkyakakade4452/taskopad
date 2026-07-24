import { useState } from 'react';
import { FolderKanban, CalendarOff, User2, ArrowUpRight, Plus, ExternalLink } from 'lucide-react';
import { Project, Task } from '../types';

interface ProjectsSectionProps {
  theme: 'dark' | 'light';
  tasks: Task[];
  onProjectSelect?: (projectName: string | null) => void;
  selectedProject?: string | null;
}

export default function ProjectsSection({ theme, tasks, onProjectSelect, selectedProject }: ProjectsSectionProps) {
  // Extract unique project names from tasks
  const uniqueProjectNames = Array.from(new Set(tasks.map(t => t.project).filter(Boolean) as string[]));

  // Color options for projects
  const colors = ['cyan', 'purple', 'emerald', 'amber', 'red', 'blue', 'pink'];

  // Generate projects dynamically from tasks
  const projects: Project[] = uniqueProjectNames.map((name, index) => {
    const projTasks = tasks.filter((t) => t.project === name);
    const completedTasks = projTasks.filter((t) => t.status === 'Completed').length;
    const totalTasks = projTasks.length;

    return {
      id: `proj-${index}`,
      name,
      creator: 'Admin',
      hasEndDate: false,
      completedTasks,
      totalTasks,
      color: colors[index % colors.length],
    };
  });

  const getThemeColors = (color: string) => {
    switch (color) {
      case 'cyan':
        return {
          barBg: 'bg-cyan-500',
          text: 'text-cyan-400',
          bg: 'bg-cyan-500/10 border-cyan-500/20',
          gradient: 'from-cyan-500/20 to-blue-500/20',
        };
      case 'purple':
        return {
          barBg: 'bg-indigo-500',
          text: 'text-indigo-400',
          bg: 'bg-indigo-500/10 border-indigo-500/20',
          gradient: 'from-indigo-500/20 to-purple-500/20',
        };
      case 'emerald':
        default:
        return {
          barBg: 'bg-emerald-500',
          text: 'text-emerald-400',
          bg: 'bg-emerald-500/10 border-emerald-500/20',
          gradient: 'from-emerald-500/20 to-teal-500/20',
        };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`font-semibold text-lg tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
            Recent Projects
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 font-normal">Active enterprise client workspaces</p>
        </div>

        {onProjectSelect && selectedProject && (
          <button
            onClick={() => onProjectSelect(null)}
            className="text-[10px] font-bold text-cyan-400 hover:underline bg-cyan-500/10 px-2.5 py-1 rounded-md"
          >
            Clear Filter [x]
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {projects.map((project) => {
          const colors = getThemeColors(project.color);
          const percent = Math.round((project.completedTasks / project.totalTasks) * 100) || 0;
          const isSelected = selectedProject === project.name;

          return (
            <div
              key={project.id}
              onClick={() => onProjectSelect && onProjectSelect(isSelected ? null : project.name)}
              className={`rounded-2xl p-5 border transition-all duration-300 shadow-md flex flex-col justify-between cursor-pointer group relative overflow-hidden ${
                isSelected
                  ? 'ring-2 ring-cyan-400 scale-[1.02]'
                  : ''
              } ${
                theme === 'dark'
                  ? 'bg-[#141C38] border-slate-800 text-slate-200 hover:border-slate-700'
                  : 'bg-white border-slate-100 text-slate-800 hover:border-slate-200'
              }`}
            >
              {/* Decorative side accent glow */}
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colors.gradient} blur-xl opacity-30 group-hover:opacity-50 transition pointer-events-none`} />

              <div>
                {/* Project Title Area */}
                <div className="flex items-start justify-between mb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8.5 h-8.5 rounded-lg flex items-center justify-center ${colors.bg}`}>
                      <FolderKanban className={`w-4.5 h-4.5 ${colors.text}`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs leading-normal group-hover:text-cyan-400 transition" title={project.name}>
                        {project.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium">Enterprise Suite</p>
                    </div>
                  </div>

                  {/* External visual clicker */}
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition" />
                </div>

                {/* Creator & Timeline Info */}
                <div className="flex flex-col gap-1.5 text-[10px] text-slate-400 mb-4 select-none font-medium">
                  <div className="flex items-center gap-1.5">
                    <User2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>By <strong className="font-semibold text-slate-300">{project.creator}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <CalendarOff className="w-3.5 h-3.5" />
                    <span className="font-bold">No End Date</span>
                  </div>
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="space-y-2 mt-2">
                <div className="flex justify-between items-center text-[10px] font-medium text-slate-400">
                  <span className="font-mono">Task Completed</span>
                  <span className="font-bold text-slate-200 font-mono">
                    {project.completedTasks}/{project.totalTasks} ({percent}%)
                  </span>
                </div>

                {/* Styled Progress Bar Container */}
                <div className={`h-2.5 w-full rounded-full overflow-hidden ${
                  theme === 'dark' ? 'bg-[#0D1631]' : 'bg-slate-100'
                }`}>
                  <div
                    className={`h-full rounded-full ${colors.barBg} transition-all duration-500 ease-out`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
