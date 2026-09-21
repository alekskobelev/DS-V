import React, { useState, useEffect } from 'react';
import { ContactCenterView } from './ContactCenterView';
import { CompanyModal } from './CompanyModal';
import { ContactModal } from './ContactModal';
import { TaskModal } from './TaskModal';
import { CalendarEventModal } from './CalendarEventModal';
import { BulkTaskModal } from './BulkTaskModal';
import { apiService } from '../../services/apiService';
import { useApp } from '../../context/AppContext';
import { UserTask, CalendarEvent, CrmCompany, CrmContact, ClientSegmentList } from '../../types';

export const ContactCenterTab: React.FC = () => {
  const { showToast } = useApp();
  const [companies, setCompanies] = useState<CrmCompany[]>([]);
  const [contacts, setContacts] = useState<CrmContact[]>([]);
  const [clientLists, setClientLists] = useState<ClientSegmentList[]>([]);
  const [tasks, setTasks] = useState<UserTask[]>([]);
  
  // Modals state
  const [isCompModalOpen, setIsCompModalOpen] = useState(false);
  const [selectedComp, setSelectedComp] = useState<CrmCompany | null>(null);

  const [isContModalOpen, setIsContModalOpen] = useState(false);
  const [selectedCont, setSelectedCont] = useState<CrmContact | null>(null);
  const [initialCompIdForCont, setInitialCompIdForCont] = useState<string>();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<UserTask | null>(null);
  const [initialCompIdForTask, setInitialCompIdForTask] = useState<string>();
  const [initialContIdForTask, setInitialContIdForTask] = useState<string>();

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [initialCompIdForEvent, setInitialCompIdForEvent] = useState<string>();
  const [initialContIdForEvent, setInitialContIdForEvent] = useState<string>();

  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<ClientSegmentList | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [compRes, contRes, listsRes, tasksRes] = await Promise.all([
        apiService.getCrmCompanies(),
        apiService.getCrmContacts(),
        apiService.getCrmClientLists(),
        apiService.getCrmTasks()
      ]);
      if (compRes.success) setCompanies(compRes.data);
      if (contRes.success) setContacts(contRes.data);
      if (listsRes.success) setClientLists(listsRes.data);
      if (tasksRes.success) setTasks(tasksRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveCompany = async (data: Partial<CrmCompany>) => {
    const res = await apiService.saveCrmCompany(data);
    if (res.success) {
      showToast('Предприятие сохранено');
      setIsCompModalOpen(false);
      loadData();
    } else {
      showToast('Ошибка при сохранении');
    }
  };

  const handleDeleteCompany = async (id: string) => {
    const res = await apiService.deleteCrmCompany(id);
    if (res.success) {
      showToast('Предприятие удалено');
      loadData();
    }
  };

  const handleSaveContact = async (data: Partial<CrmContact>) => {
    const res = await apiService.saveCrmContact(data);
    if (res.success) {
      showToast('Контакт сохранен');
      setIsContModalOpen(false);
      loadData();
    } else {
      showToast('Ошибка при сохранении');
    }
  };

  const handleDeleteContact = async (id: string) => {
    const res = await apiService.deleteCrmContact(id);
    if (res.success) {
      showToast('Контакт удален');
      loadData();
    }
  };

  const handleSaveList = async (data: Partial<ClientSegmentList>) => {
    const res = await apiService.saveCrmClientList(data);
    if (res.success) {
      showToast('Список сохранен');
      loadData();
    } else {
      showToast('Ошибка при сохранении');
    }
  };

  const handleDeleteList = async (id: string) => {
    const res = await apiService.deleteCrmClientList(id);
    if (res.success) {
      showToast('Список удален');
      loadData();
    }
  };

  const handleSaveTask = async (data: Partial<UserTask>) => {
    const res = await apiService.saveCrmTask(data);
    if (res.success) {
      showToast('Задача сохранена');
      setIsTaskModalOpen(false);
      loadData();
    }
  };

  const handleSaveEvent = async (data: Partial<CalendarEvent>) => {
    const res = await apiService.saveCrmCalendarEvent(data);
    if (res.success) {
      showToast('Событие сохранено');
      setIsEventModalOpen(false);
      loadData();
    }
  };

  const handleBulkTask = async (taskData: any) => {
    if (!selectedList) return;
    const res = await apiService.executeCrmBulkTask(selectedList.id, taskData);
    if (res.success) {
      showToast('Массовые задачи успешно созданы');
      setIsBulkModalOpen(false);
      loadData();
    } else {
      showToast('Ошибка при создании массовых задач');
    }
  };

  return (
    <>
      <ContactCenterView
        companies={companies}
        contacts={contacts}
        clientLists={clientLists}
        tasks={tasks}
        onOpenCompanyModal={(comp) => {
          setSelectedComp(comp || null);
          setIsCompModalOpen(true);
        }}
        onDeleteCompany={handleDeleteCompany}
        onOpenContactModal={(cont, compId) => {
          setSelectedCont(cont || null);
          setInitialCompIdForCont(compId);
          setIsContModalOpen(true);
        }}
        onDeleteContact={handleDeleteContact}
        onOpenTaskModal={(task, compId, contId) => {
          setSelectedTask(task || null);
          setInitialCompIdForTask(compId);
          setInitialContIdForTask(contId);
          setIsTaskModalOpen(true);
        }}
        onOpenEventModal={(compId, contId) => {
          setInitialCompIdForEvent(compId);
          setInitialContIdForEvent(contId);
          setIsEventModalOpen(true);
        }}
        onSaveClientList={handleSaveList}
        onDeleteClientList={handleDeleteList}
        onOpenBulkTaskModal={(list) => {
          setSelectedList(list);
          setIsBulkModalOpen(true);
        }}
        onImportExcel={(file) => {
          showToast(`Файл ${file.name} успешно импортирован.`);
          // In a real application, you would parse the Excel file and send the data to the backend API here.
          setTimeout(() => loadData(), 1000);
        }}
      />

      {isCompModalOpen && (
        <CompanyModal
          isOpen={isCompModalOpen}
          onClose={() => setIsCompModalOpen(false)}
          onSave={handleSaveCompany}
          onDelete={handleDeleteCompany}
          company={selectedComp}
          contacts={contacts}
          tasks={tasks}
          onOpenTaskModal={(task, compId) => {
            setIsCompModalOpen(false);
            setSelectedTask(task || null);
            setInitialCompIdForTask(compId);
            setInitialContIdForTask(undefined);
            setIsTaskModalOpen(true);
          }}
          onOpenEventModal={(compId) => {
            setIsCompModalOpen(false);
            setInitialCompIdForEvent(compId);
            setInitialContIdForEvent(undefined);
            setIsEventModalOpen(true);
          }}
        />
      )}

      {isContModalOpen && (
        <ContactModal
          isOpen={isContModalOpen}
          onClose={() => setIsContModalOpen(false)}
          onSave={handleSaveContact}
          contact={selectedCont}
          companies={companies}
          initialCompanyId={initialCompIdForCont}
        />
      )}

      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onSave={handleSaveTask}
          task={selectedTask}
          companies={companies}
          contacts={contacts}
          initialCompanyId={initialCompIdForTask}
          initialContactId={initialContIdForTask}
        />
      )}

      {isEventModalOpen && (
        <CalendarEventModal
          isOpen={isEventModalOpen}
          onClose={() => setIsEventModalOpen(false)}
          onSave={handleSaveEvent}
          companies={companies}
          contacts={contacts}
          initialCompanyId={initialCompIdForEvent}
          initialContactId={initialContIdForEvent}
        />
      )}

      {isBulkModalOpen && selectedList && (
        <BulkTaskModal
          isOpen={isBulkModalOpen}
          onClose={() => setIsBulkModalOpen(false)}
          onSave={handleBulkTask}
          targetList={selectedList}
        />
      )}
    </>
  );
};
