const fs = require('fs');

let content = fs.readFileSync('src/components/crm/ManagerTasksCalendarView.tsx', 'utf-8');

// Add dragging state
content = content.replace(
  /const \[tasksDisplayMode, setTasksDisplayMode\] = useState<'kanban' \| 'list'>\('kanban'\);/,
  `const [tasksDisplayMode, setTasksDisplayMode] = useState<'kanban' | 'list'>('kanban');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    // Firefox requires setting data to drag
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    if (!draggedTaskId) return;
    
    // Find the task
    const task = tasks.find(t => t.id === draggedTaskId);
    if (task && task.status !== columnId) {
      // Cast columnId to TaskStatus
      await handleQuickStatusChange(draggedTaskId, columnId as 'new' | 'in_progress' | 'postponed' | 'completed');
    }
    setDraggedTaskId(null);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };`
);

// Update Kanban columns rendering
const oldColHeader = `                  <div 
                    key={col.id} 
                    className="bg-slate-50/80 border border-slate-200 rounded-2xl p-3.5 flex flex-col min-h-[450px]"
                  >`;
const newColHeader = `                  <div 
                    key={col.id} 
                    onDragOver={(e) => handleDragOver(e, col.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, col.id)}
                    className={\`border rounded-2xl p-3.5 flex flex-col min-h-[450px] transition-colors \${
                      dragOverColumn === col.id ? 'bg-blue-50 border-blue-300 shadow-inner' : 'bg-slate-50/80 border-slate-200'
                    }\`}
                  >`;

content = content.replace(oldColHeader, newColHeader);

// Update Kanban task card rendering
const oldTaskCard = `                          return (
                            <div
                              key={task.id}
                              className={\`bg-white rounded-xl p-3.5 border transition-all hover:shadow-md \${
                                isOverdue 
                                  ? 'border-red-300 bg-red-50/20' 
                                  : 'border-gray-200'
                              }\`}`;

const newTaskCard = `                          return (
                            <div
                              key={task.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, task.id)}
                              onDragEnd={handleDragEnd}
                              className={\`bg-white rounded-xl p-3.5 border transition-all hover:shadow-md cursor-grab active:cursor-grabbing \${
                                draggedTaskId === task.id ? 'opacity-40 scale-95' : 'opacity-100'
                              } \${
                                isOverdue 
                                  ? 'border-red-300 bg-red-50/20' 
                                  : 'border-gray-200'
                              }\`}`;

content = content.replace(oldTaskCard, newTaskCard);

fs.writeFileSync('src/components/crm/ManagerTasksCalendarView.tsx', content);
