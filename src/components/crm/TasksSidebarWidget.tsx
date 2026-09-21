import React, { useState, useEffect } from 'react';
import { MyTodayTasksWidget } from './MyTodayTasksWidget';
import { TaskModal } from './TaskModal';
import { apiService } from '../../services/apiService';
import { useApp } from '../../context/AppContext';
import { UserTask, CrmCompany, CrmContact } from '../../types';

interface Props {
  onOpenFullModule: () => void;
}

export const TasksSidebarWidget: React.FC<Props> = ({ onOpenFullModule }) => {
  const { currentUser } = useApp();
  const [tasks, setTasks] = useState<UserTask[]>([]);
  const [companies, setCompanies] = useState<CrmCompany[]>([]);
  const [contacts, setContacts] = useState<CrmContact[]>([]);
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<UserTask | null>(null);

  useEffect(() => {
    if (currentUser?.id) {
      loadData();
    }
  }, [currentUser?.id]);

  const loadData = async () => {
    try {
      const [tasksRes, compRes, contRes] = await Promise.all([
        apiService.getCrmTasks({ managerId: currentUser?.id }),
        apiService.getCrmCompanies(),
        apiService.getCrmContacts()
      ]);
      if (tasksRes.success) setTasks(tasksRes.data);
      if (compRes.success) setCompanies(compRes.data);
      if (contRes.success) setContacts(contRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleTaskStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'in_progress' : 'completed';
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus as any } : t));
    const res = await apiService.saveCrmTask({ id, status: newStatus });
    if (!res.success) {
      loadData(); // revert on fail
    }
  };

  const handleSaveTask = async (taskData: Partial<UserTask>) => {
    const res = await apiService.saveCrmTask(taskData);
    if (res.success) {
      setIsTaskModalOpen(false);
      loadData();
    }
  };

  return (
    <>
      <MyTodayTasksWidget
        tasks={tasks}
        onToggleTaskStatus={handleToggleTaskStatus}
        onOpenTaskModal={(task) => {
          setSelectedTask(task || null);
          setIsTaskModalOpen(true);
        }}
        onOpenFullModule={onOpenFullModule}
      />
      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onSave={handleSaveTask}
          task={selectedTask}
          companies={companies}
          contacts={contacts}
        />
      )}
    </>
  );
};
