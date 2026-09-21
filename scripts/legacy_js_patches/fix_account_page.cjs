const fs = require('fs');
let code = fs.readFileSync('src/pages/AccountPage.tsx', 'utf8');

const effectCode = `  const [tickets, setTickets] = useState<Ticket[]>([
    { id: 'TCK-2023-089', date: '12.05.2023', subject: 'Доработка постпроцессора DMU 50', status: 'closed', product: 'TopSolid 7' },
    { id: 'TCK-2023-112', date: '04.11.2023', subject: 'Ошибка лицензирования', status: 'in_progress', product: 'SprutCAM' }
  ]);

  // Загрузка B2B тикетов с сервера
  useEffect(() => {
    let isMounted = true;
    apiService.getB2BTickets('ds-engineering').then((serverTickets) => {
      if (!isMounted || !serverTickets || serverTickets.length === 0) return;
      
      const mapped = serverTickets.map(st => ({
        id: st.id,
        date: new Date(st.createdAt).toLocaleDateString('ru-RU'),
        subject: st.title,
        status: st.status === 'completed' ? 'closed' : st.status === 'in_progress' ? 'in_progress' : 'open',
        product: st.equipmentModel || st.category
      }));
      setTickets(mapped);
    });
    return () => { isMounted = false; };
  }, []);`;

code = code.replace(/const \[tickets, setTickets\] = useState<Ticket\[\]>\([\s\S]*?\]\);/, effectCode);
fs.writeFileSync('src/pages/AccountPage.tsx', code);
console.log('AccountPage connected to getB2BTickets');
