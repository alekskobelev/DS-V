const fs = require('fs');
let content = fs.readFileSync('src/components/crm/CrmPanel.tsx', 'utf8');

const scrollState = `
  // Kanban Scroll State
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft) < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener('resize', handleScroll);
    return () => window.removeEventListener('resize', handleScroll);
  }, [activeFunnel, deals]);

  const scrollBoard = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };
`;

if (!content.includes('const scrollContainerRef')) {
  content = content.replace('const filteredDeals = useMemo(() => {', scrollState + '\n  const filteredDeals = useMemo(() => {');
  fs.writeFileSync('src/components/crm/CrmPanel.tsx', content);
  console.log("Scroll state injected");
} else {
  console.log("Scroll state already exists");
}
