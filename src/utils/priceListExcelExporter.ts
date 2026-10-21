import { PriceItem, PriceDiscountRule, calculateItemEconomics, calculateDiscountForItem } from '../data/priceListsData';

/**
 * Escapes XML special characters for safe inclusion in XML Spreadsheet
 */
function escapeXml(str: string | number | null | undefined): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates an Excel Worksheet XML block with headers, styles, auto-filter and data rows
 */
function generateXmlWorksheet(
  sheetName: string,
  items: PriceItem[],
  discountRules: PriceDiscountRule[],
  includeEconomics: boolean = true
): string {
  const columnCount = includeEconomics ? 16 : 12;

  let rowsXml = '';

  // Header Row (Row 1)
  rowsXml += `
    <Row ss:Height="26" ss:StyleID="HeaderRow">
      <Cell ss:StyleID="HeaderCell"><Data ss:Type="String">Артикул (SKU)</Data></Cell>
      <Cell ss:StyleID="HeaderCell"><Data ss:Type="String">Наименование товара / услуги</Data></Cell>
      <Cell ss:StyleID="HeaderCell"><Data ss:Type="String">Категория</Data></Cell>
      <Cell ss:StyleID="HeaderCell"><Data ss:Type="String">Подкатегория / Тип</Data></Cell>
      <Cell ss:StyleID="HeaderCell"><Data ss:Type="String">Производитель / Бренд</Data></Cell>
      <Cell ss:StyleID="HeaderCell"><Data ss:Type="String">Ед. изм.</Data></Cell>
      ${includeEconomics ? '<Cell ss:StyleID="HeaderCell"><Data ss:Type="String">Себестоимость закупки (₽)</Data></Cell>' : ''}
      <Cell ss:StyleID="HeaderCell"><Data ss:Type="String">Базовая цена без НДС (₽)</Data></Cell>
      <Cell ss:StyleID="HeaderCell"><Data ss:Type="String">Скидка</Data></Cell>
      <Cell ss:StyleID="HeaderCell"><Data ss:Type="String">Цена со скидкой (₽)</Data></Cell>
      <Cell ss:StyleID="HeaderCell"><Data ss:Type="String">НДС (%)</Data></Cell>
      <Cell ss:StyleID="HeaderCell"><Data ss:Type="String">Итого с НДС 22% (₽)</Data></Cell>
      ${includeEconomics ? '<Cell ss:StyleID="HeaderCell"><Data ss:Type="String">Маржинальность (%)</Data></Cell>' : ''}
      ${includeEconomics ? '<Cell ss:StyleID="HeaderCell"><Data ss:Type="String">Наценка (%)</Data></Cell>' : ''}
      <Cell ss:StyleID="HeaderCell"><Data ss:Type="String">Наличие</Data></Cell>
      <Cell ss:StyleID="HeaderCell"><Data ss:Type="String">Срок поставки (дн.)</Data></Cell>
    </Row>
  `;

  // Data Rows
  items.forEach((item, index) => {
    const isEven = index % 2 === 0;
    const rowStyle = isEven ? 'EvenRow' : 'OddRow';
    const numStyle = isEven ? 'EvenNum' : 'OddNum';
    const currStyle = isEven ? 'EvenCurrency' : 'OddCurrency';
    const pctStyle = isEven ? 'EvenPercent' : 'OddPercent';

    const econ = calculateItemEconomics(item.costPriceRub, item.priceRub);
    const discCalc = calculateDiscountForItem(item, discountRules, 1);
    const finalPriceWithoutVat = discCalc.finalPriceRub;
    const finalPriceWithVat = Math.round(finalPriceWithoutVat * (1 + (item.vatRate || 22) / 100));

    let discountLabel = '0%';
    if (item.discount) {
      if (typeof item.discount === 'number') {
        discountLabel = `${item.discount}%`;
      } else if (item.discount.type === 'percent') {
        discountLabel = `${item.discount.value}%`;
      } else {
        discountLabel = `${item.discount.value.toLocaleString('ru-RU')} ₽`;
      }
    } else if (discCalc.appliedRule) {
      discountLabel = discCalc.appliedRule.discountType === 'percent'
        ? `${discCalc.appliedRule.discountValue}%`
        : `${discCalc.appliedRule.discountValue.toLocaleString('ru-RU')} ₽`;
    }

    const stockStatus = item.inStock ? 'В наличии' : 'Под заказ';
    const stockStyle = item.inStock ? 'StockIn' : 'StockOrder';

    rowsXml += `
      <Row ss:Height="20">
        <Cell ss:StyleID="${rowStyle}"><Data ss:Type="String">${escapeXml(item.sku)}</Data></Cell>
        <Cell ss:StyleID="${rowStyle}"><Data ss:Type="String">${escapeXml(item.name)}</Data></Cell>
        <Cell ss:StyleID="${rowStyle}"><Data ss:Type="String">${escapeXml(item.categoryLabel || item.category)}</Data></Cell>
        <Cell ss:StyleID="${rowStyle}"><Data ss:Type="String">${escapeXml(item.subCategory || '')}</Data></Cell>
        <Cell ss:StyleID="${rowStyle}"><Data ss:Type="String">${escapeXml(item.manufacturer || '')}</Data></Cell>
        <Cell ss:StyleID="${numStyle}"><Data ss:Type="String">${escapeXml(item.unit || 'шт.')}</Data></Cell>
        ${includeEconomics ? `<Cell ss:StyleID="${currStyle}"><Data ss:Type="Number">${item.costPriceRub || 0}</Data></Cell>` : ''}
        <Cell ss:StyleID="${currStyle}"><Data ss:Type="Number">${item.priceRub || 0}</Data></Cell>
        <Cell ss:StyleID="${numStyle}"><Data ss:Type="String">${escapeXml(discountLabel)}</Data></Cell>
        <Cell ss:StyleID="${currStyle}"><Data ss:Type="Number">${finalPriceWithoutVat}</Data></Cell>
        <Cell ss:StyleID="${numStyle}"><Data ss:Type="Number">${item.vatRate || 22}</Data></Cell>
        <Cell ss:StyleID="${currStyle}"><Data ss:Type="Number">${finalPriceWithVat}</Data></Cell>
        ${includeEconomics ? `<Cell ss:StyleID="${pctStyle}"><Data ss:Type="Number">${(econ.marginPercent / 100)}</Data></Cell>` : ''}
        ${includeEconomics ? `<Cell ss:StyleID="${pctStyle}"><Data ss:Type="Number">${(econ.markupPercent / 100)}</Data></Cell>` : ''}
        <Cell ss:StyleID="${stockStyle}"><Data ss:Type="String">${escapeXml(stockStatus)}</Data></Cell>
        <Cell ss:StyleID="${numStyle}"><Data ss:Type="Number">${item.leadTimeDays || 0}</Data></Cell>
      </Row>
    `;
  });

  const lastRowIndex = items.length + 1;

  return `
  <Worksheet ss:Name="${escapeXml(sheetName)}">
    <Table ss:ExpandedColumnCount="${columnCount + 2}" ss:ExpandedRowCount="${lastRowIndex + 5}" x:FullColumns="1" x:FullRows="1" ss:DefaultRowHeight="16">
      <Column ss:Width="110"/>
      <Column ss:Width="310"/>
      <Column ss:Width="160"/>
      <Column ss:Width="150"/>
      <Column ss:Width="140"/>
      <Column ss:Width="65"/>
      ${includeEconomics ? '<Column ss:Width="130"/>' : ''}
      <Column ss:Width="130"/>
      <Column ss:Width="90"/>
      <Column ss:Width="130"/>
      <Column ss:Width="65"/>
      <Column ss:Width="135"/>
      ${includeEconomics ? '<Column ss:Width="90"/>' : ''}
      ${includeEconomics ? '<Column ss:Width="90"/>' : ''}
      <Column ss:Width="95"/>
      <Column ss:Width="85"/>
      ${rowsXml}
    </Table>
    <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
      <PageSetup>
        <Header x:Margin="0.3"/>
        <Footer x:Margin="0.3"/>
        <PageMargins x:Bottom="0.75" x:Left="0.7" x:Right="0.7" x:Top="0.75"/>
      </PageSetup>
      <Unsynced/>
      <Selected/>
      <FreezePanes/>
      <FrozenNoSplit/>
      <SplitHorizontal>1</SplitHorizontal>
      <TopRowBottomPane>1</TopRowBottomPane>
      <ActivePane>2</ActivePane>
      <Panes>
        <Pane>
          <Number>3</Number>
        </Pane>
        <Pane>
          <Number>2</Number>
          <ActiveRow>1</ActiveRow>
          <ActiveCol>1</ActiveCol>
        </Pane>
      </Panes>
      <ProtectObjects>False</ProtectObjects>
      <ProtectScenarios>False</ProtectScenarios>
    </WorksheetOptions>
    <AutoFilter x:Range="R1C1:R${lastRowIndex}C${columnCount}" xmlns="urn:schemas-microsoft-com:office:excel"/>
  </Worksheet>
  `;
}

/**
 * Generates XML Worksheet for Discount Rules
 */
function generateDiscountsWorksheet(rules: PriceDiscountRule[]): string {
  let rowsXml = `
    <Row ss:Height="26" ss:StyleID="HeaderRow">
      <Cell ss:StyleID="HeaderCell"><Data ss:Type="String">Название правила</Data></Cell>
      <Cell ss:StyleID="HeaderCell"><Data ss:Type="String">Область действия</Data></Cell>
      <Cell ss:StyleID="HeaderCell"><Data ss:Type="String">Категория / Позиция</Data></Cell>
      <Cell ss:StyleID="HeaderCell"><Data ss:Type="String">Тип скидки</Data></Cell>
      <Cell ss:StyleID="HeaderCell"><Data ss:Type="String">Величина скидки</Data></Cell>
      <Cell ss:StyleID="HeaderCell"><Data ss:Type="String">Мин. кол-во (шт)</Data></Cell>
      <Cell ss:StyleID="HeaderCell"><Data ss:Type="String">Мин. сумма заказа (₽)</Data></Cell>
      <Cell ss:StyleID="HeaderCell"><Data ss:Type="String">Статус</Data></Cell>
      <Cell ss:StyleID="HeaderCell"><Data ss:Type="String">Описание / Условия</Data></Cell>
    </Row>
  `;

  rules.forEach((rule, idx) => {
    const isEven = idx % 2 === 0;
    const rowStyle = isEven ? 'EvenRow' : 'OddRow';
    const numStyle = isEven ? 'EvenNum' : 'OddNum';
    const currStyle = isEven ? 'EvenCurrency' : 'OddCurrency';
    const statusStyle = rule.isActive ? 'StockIn' : 'StockOrder';

    const scopeLabel = rule.scope === 'global' ? 'На весь заказ' : rule.scope === 'category' ? 'По категории' : 'По позиции';
    const targetLabel = rule.targetItemName || rule.targetCategoryLabel || 'Все товары';
    const typeLabel = rule.discountType === 'percent' ? 'Процентная (%)' : 'Фиксированная (₽)';
    const valLabel = rule.discountType === 'percent' ? `${rule.discountValue}%` : `${rule.discountValue.toLocaleString('ru-RU')} ₽`;

    rowsXml += `
      <Row ss:Height="20">
        <Cell ss:StyleID="${rowStyle}"><Data ss:Type="String">${escapeXml(rule.name)}</Data></Cell>
        <Cell ss:StyleID="${rowStyle}"><Data ss:Type="String">${escapeXml(scopeLabel)}</Data></Cell>
        <Cell ss:StyleID="${rowStyle}"><Data ss:Type="String">${escapeXml(targetLabel)}</Data></Cell>
        <Cell ss:StyleID="${numStyle}"><Data ss:Type="String">${escapeXml(typeLabel)}</Data></Cell>
        <Cell ss:StyleID="${numStyle}"><Data ss:Type="String">${escapeXml(valLabel)}</Data></Cell>
        <Cell ss:StyleID="${numStyle}"><Data ss:Type="Number">${rule.minOrderQuantity || 1}</Data></Cell>
        <Cell ss:StyleID="${currStyle}"><Data ss:Type="Number">${rule.minOrderAmountRub || 0}</Data></Cell>
        <Cell ss:StyleID="${statusStyle}"><Data ss:Type="String">${rule.isActive ? 'Активно' : 'Приостановлено'}</Data></Cell>
        <Cell ss:StyleID="${rowStyle}"><Data ss:Type="String">${escapeXml(rule.description || '')}</Data></Cell>
      </Row>
    `;
  });

  const lastRow = rules.length + 1;

  return `
  <Worksheet ss:Name="6. Правила скидок и акции">
    <Table ss:ExpandedColumnCount="10" ss:ExpandedRowCount="${lastRow + 5}" x:FullColumns="1" x:FullRows="1" ss:DefaultRowHeight="16">
      <Column ss:Width="240"/>
      <Column ss:Width="130"/>
      <Column ss:Width="200"/>
      <Column ss:Width="130"/>
      <Column ss:Width="120"/>
      <Column ss:Width="90"/>
      <Column ss:Width="130"/>
      <Column ss:Width="110"/>
      <Column ss:Width="280"/>
      ${rowsXml}
    </Table>
    <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
      <FreezePanes/>
      <FrozenNoSplit/>
      <SplitHorizontal>1</SplitHorizontal>
      <TopRowBottomPane>1</TopRowBottomPane>
    </WorksheetOptions>
    <AutoFilter x:Range="R1C1:R${lastRow}C9" xmlns="urn:schemas-microsoft-com:office:excel"/>
  </Worksheet>
  `;
}

export interface ExportFilterSortOptions {
  sortField?: 'sku' | 'name' | 'category' | 'priceRub' | 'costPriceRub' | 'marginPercent' | 'leadTimeDays';
  sortDirection?: 'asc' | 'desc';
  categoryFilter?: string;
  stockFilter?: 'all' | 'in_stock' | 'on_order';
  includeEconomics?: boolean;
  searchQuery?: string;
}

/**
 * Filters and sorts items based on provided options
 */
export function filterAndSortItems(
  items: PriceItem[],
  options?: ExportFilterSortOptions
): PriceItem[] {
  if (!options) return [...items];

  let list = items.filter((item) => {
    if (options.categoryFilter && options.categoryFilter !== 'all' && item.category !== options.categoryFilter) {
      return false;
    }
    if (options.stockFilter === 'in_stock' && !item.inStock) return false;
    if (options.stockFilter === 'on_order' && item.inStock) return false;
    if (options.searchQuery?.trim()) {
      const q = options.searchQuery.toLowerCase().trim();
      const matchSku = item.sku?.toLowerCase().includes(q);
      const matchName = item.name?.toLowerCase().includes(q);
      const matchManuf = item.manufacturer?.toLowerCase().includes(q);
      if (!matchSku && !matchName && !matchManuf) return false;
    }
    return true;
  });

  if (options.sortField) {
    const field = options.sortField;
    const dir = options.sortDirection || 'asc';
    list.sort((a, b) => {
      let valA: any = a[field];
      let valB: any = b[field];

      if (field === 'marginPercent') {
        const econA = calculateItemEconomics(a.costPriceRub, a.priceRub);
        const econB = calculateItemEconomics(b.costPriceRub, b.priceRub);
        valA = econA.marginPercent;
        valB = econB.marginPercent;
      }

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (typeof valA === 'string') {
        return dir === 'asc' ? valA.localeCompare(valB, 'ru') : valB.localeCompare(valA, 'ru');
      } else {
        return dir === 'asc' ? valA - valB : valB - valA;
      }
    });
  }

  return list;
}

/**
 * Builds the complete multi-sheet Excel Workbook XML with sorting & filtering applied
 */
export function buildMultiSheetExcelXml(
  items: PriceItem[],
  discountRules: PriceDiscountRule[] = [],
  includeEconomics: boolean = true,
  options?: ExportFilterSortOptions
): string {
  const processedItems = options ? filterAndSortItems(items, options) : [...items];

  // Categorize items
  const hardwareItems = processedItems.filter(i => i.category === 'hardware');
  const softwareItems = processedItems.filter(i => i.category === 'software');
  const servicesItems = processedItems.filter(i => i.category === 'services');
  const accessoriesItems = processedItems.filter(i => i.category === 'accessories');
  const nonCoreItems = processedItems.filter(i => i.category === 'non_core_services');

  const sheetsXml = [
    generateXmlWorksheet('Вся номенклатура (Сводный)', processedItems, discountRules, includeEconomics),
    generateXmlWorksheet('1. Оборудование КИМ и 3D', hardwareItems, discountRules, includeEconomics),
    generateXmlWorksheet('2. Программное обеспечение', softwareItems, discountRules, includeEconomics),
    generateXmlWorksheet('3. Инжиниринговые услуги', servicesItems, discountRules, includeEconomics),
    generateXmlWorksheet('4. Оснастка и щупы Renishaw', accessoriesItems, discountRules, includeEconomics),
    generateXmlWorksheet('5. Сервис и калибровка', nonCoreItems, discountRules, includeEconomics),
    generateDiscountsWorksheet(discountRules)
  ].join('\n');

  return `<?xml version="1.0" encoding="utf-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
  <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
    <Title>Прайс-лист ООО «ДС-Инжиниринг»</Title>
    <Subject>Официальный номенклатурный прайс-лист оборудования КИМ, 3D-сканеров, ПО и услуг</Subject>
    <Author>ООО «ДС-Инжиниринг»</Author>
    <Created>${new Date().toISOString()}</Created>
    <Company>ООО «ДС-Инжиниринг»</Company>
    <Version>2.9.236</Version>
  </DocumentProperties>
  <OfficeDocumentSettings xmlns="urn:schemas-microsoft-com:office:office">
    <AllowPNG/>
  </OfficeDocumentSettings>
  <ExcelWorkbook xmlns="urn:schemas-microsoft-com:office:excel">
    <WindowHeight>12000</WindowHeight>
    <WindowWidth>24000</WindowWidth>
    <WindowTopX>0</WindowTopX>
    <WindowTopY>0</WindowTopY>
    <ProtectStructure>False</ProtectStructure>
    <ProtectWindows>False</ProtectWindows>
  </ExcelWorkbook>
  <Styles>
    <!-- Base Default -->
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Center"/>
      <Borders/>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#1E293B"/>
      <Interior/>
      <NumberFormat/>
      <Protection/>
    </Style>

    <!-- Header Styles -->
    <Style ss:ID="HeaderRow">
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#1E3A8A" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="HeaderCell">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0F172A"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#0F172A"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#1E3A8A" ss:Pattern="Solid"/>
    </Style>

    <!-- Row Data Styles -->
    <Style ss:ID="EvenRow">
      <Alignment ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
      </Borders>
      <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="OddRow">
      <Alignment ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
      </Borders>
      <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
    </Style>

    <!-- Number / Center Styles -->
    <Style ss:ID="EvenNum">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
      </Borders>
      <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="OddNum">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
      </Borders>
      <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
    </Style>

    <!-- Currency Styles -->
    <Style ss:ID="EvenCurrency">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
      </Borders>
      <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
      <NumberFormat ss:Format="#,##0\ &quot;₽&quot;"/>
    </Style>
    <Style ss:ID="OddCurrency">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
      </Borders>
      <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
      <NumberFormat ss:Format="#,##0\ &quot;₽&quot;"/>
    </Style>

    <!-- Percentage Styles -->
    <Style ss:ID="EvenPercent">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
      </Borders>
      <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
      <NumberFormat ss:Format="0.0%"/>
    </Style>
    <Style ss:ID="OddPercent">
      <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
      </Borders>
      <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>
      <NumberFormat ss:Format="0.0%"/>
    </Style>

    <!-- Stock Status Styles -->
    <Style ss:ID="StockIn">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Bold="1" ss:Color="#047857"/>
      <Interior ss:Color="#ECFDF5" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="StockOrder">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Bold="1" ss:Color="#B45309"/>
      <Interior ss:Color="#FFFBEB" ss:Pattern="Solid"/>
    </Style>
  </Styles>
  ${sheetsXml}
</Workbook>`;
}

/**
 * Initiates browser download of the multi-sheet Excel file (.xls XML format)
 */
export function exportPriceListToExcel(
  items: PriceItem[],
  discountRules: PriceDiscountRule[] = [],
  includeEconomics: boolean = true,
  filename?: string,
  options?: ExportFilterSortOptions
): string {
  const xmlContent = buildMultiSheetExcelXml(items, discountRules, includeEconomics, options);
  if (typeof document === 'undefined') {
    return xmlContent;
  }
  const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const dateStr = new Date().toISOString().slice(0, 10);
  link.download = filename || `Прайс-лист_ДС-Инжиниринг_Многостраничный_${dateStr}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return xmlContent;
}

/**
 * Helper to build CSV text for a given list of PriceItem
 */
function buildCsvRows(
  items: PriceItem[],
  discountRules: PriceDiscountRule[] = [],
  includeEconomics: boolean = true
): string {
  const headers = [
    'Артикул (SKU)',
    'Наименование',
    'Категория',
    'Подкатегория',
    'Производитель',
    'Ед. изм.',
    ...(includeEconomics ? ['Себестоимость (руб)'] : []),
    'Базовая цена (руб)',
    'Скидка',
    'Цена со скидкой (руб)',
    'Ставка НДС (%)',
    'Цена с НДС 22% (руб)',
    ...(includeEconomics ? ['Маржинальность (%)', 'Наценка (%)'] : []),
    'Наличие',
    'Срок поставки (дн)',
    'Версия цены'
  ];

  const rows = items.map((item) => {
    const econ = calculateItemEconomics(item.costPriceRub, item.priceRub);
    const discCalc = calculateDiscountForItem(item, discountRules, 1);
    const priceWithVat = Math.round(discCalc.finalPriceRub * 1.22);
    const discountLabel = item.discount
      ? (typeof item.discount === 'number' ? `${item.discount}%` : (item.discount.type === 'percent' ? `${item.discount.value}%` : `${item.discount.value} ₽`))
      : (discCalc.appliedRule ? (discCalc.appliedRule.discountType === 'percent' ? `${discCalc.appliedRule.discountValue}%` : `${discCalc.appliedRule.discountValue} ₽`) : '0%');

    const fields: (string | number)[] = [
      `"${item.sku}"`,
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.categoryLabel || item.category}"`,
      `"${item.subCategory || ''}"`,
      `"${item.manufacturer || ''}"`,
      `"${item.unit || 'шт.'}"`
    ];

    if (includeEconomics) {
      fields.push(item.costPriceRub || 0);
    }

    fields.push(
      item.priceRub || 0,
      `"${discountLabel}"`,
      discCalc.finalPriceRub,
      item.vatRate || 22,
      priceWithVat
    );

    if (includeEconomics) {
      fields.push(econ.marginPercent, econ.markupPercent);
    }

    fields.push(
      item.inStock ? 'В наличии' : 'Под заказ',
      item.leadTimeDays || 0,
      `v${item.currentVersion || 1}`
    );

    return fields.join(';');
  });

  return [headers.join(';'), ...rows].join('\r\n');
}

/**
 * Initiates browser download of flat CSV file with sorting & filtering options
 */
export function exportPriceListToCsv(
  items: PriceItem[],
  discountRules: PriceDiscountRule[] = [],
  filename?: string,
  options?: ExportFilterSortOptions
): string {
  const processedItems = options ? filterAndSortItems(items, options) : [...items];
  const includeEconomics = options?.includeEconomics !== false;
  const csvContent = '\uFEFF' + buildCsvRows(processedItems, discountRules, includeEconomics);
  if (typeof document === 'undefined') {
    return csvContent;
  }
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const dateStr = new Date().toISOString().slice(0, 10);
  link.download = filename || `Прайс-лист_ДС-Инжиниринг_${dateStr}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return csvContent;
}

/**
 * Exports CSV structured with separate Sheet/Section blocks for every category,
 * complete with individual headers, totals, sorting, and filters applied.
 */
export function exportPriceListMultiSectionCsv(
  items: PriceItem[],
  discountRules: PriceDiscountRule[] = [],
  options?: ExportFilterSortOptions,
  onGenerated?: (content: string) => void
): string {
  const processedItems = options ? filterAndSortItems(items, options) : [...items];
  const includeEconomics = options?.includeEconomics !== false;

  const sections: { title: string; category: string }[] = [
    { title: 'ЛИСТ 1. ОБОРУДОВАНИЕ КИМ И 3D', category: 'hardware' },
    { title: 'ЛИСТ 2. ПРОГРАММНОЕ ОБЕСПЕЧЕНИЕ (CAD/CAM/Метрология)', category: 'software' },
    { title: 'ЛИСТ 3. ИНЖИНИРИНГОВЫЕ И МЕТРОЛОГИЧЕСКИЕ УСЛУГИ', category: 'services' },
    { title: 'ЛИСТ 4. ОСНАСТКА, КАЛИБРОВКА И ЩУПЫ RENISHAW', category: 'accessories' },
    { title: 'ЛИСТ 5. СЕРВИСНОЕ ОБСЛУЖИВАНИЕ И ПОВЕРКА (АРШИН)', category: 'non_core_services' }
  ];

  const blocks: string[] = [];

  // Title Banner
  blocks.push(
    `# ==========================================================================\r\n` +
    `# ПРЕЙСКУРАНТ И НОМЕНКЛАТУРНЫЙ СПРАВОЧНИК ООО «ДС-ИНЖИНИРИНГ»\r\n` +
    `# Дата экспорта: ${new Date().toLocaleDateString('ru-RU')} | Всего позиций: ${processedItems.length}\r\n` +
    `# Сортировка: ${options?.sortField || 'по умолчанию'} (${options?.sortDirection || 'asc'})\r\n` +
    `# ==========================================================================`
  );

  // Each Category as a separate "Sheet"
  sections.forEach((sec, idx) => {
    const secItems = processedItems.filter(i => i.category === sec.category);
    if (secItems.length === 0) return;

    let totalSum = 0;
    secItems.forEach(i => { totalSum += (i.priceRub || 0); });

    blocks.push(
      `\r\n\r\n` +
      `# --------------------------------------------------------------------------\r\n` +
      `# >>> ${sec.title} <<<\r\n` +
      `# Позиций в разделе: ${secItems.length} | Суммарная базовая стоимость: ${totalSum.toLocaleString('ru-RU')} руб.\r\n` +
      `# ИТОГО ПО РАЗДЕЛУ: ${totalSum.toLocaleString('ru-RU')} руб.\r\n` +
      `# --------------------------------------------------------------------------\r\n` +
      buildCsvRows(secItems, discountRules, includeEconomics)
    );
  });

  const fullContent = '\uFEFF' + blocks.join('\r\n');
  if (onGenerated) {
    onGenerated(fullContent);
  }
  if (typeof document === 'undefined') {
    return fullContent;
  }
  const blob = new Blob([fullContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const dateStr = new Date().toISOString().slice(0, 10);
  link.download = `Прайс-лист_ДС-Инжиниринг_Многостраничный_Разделы_${dateStr}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return fullContent;
}

/**
 * Exports separate CSV files per each category sheet (downloaded sequentially)
 */
export async function exportPriceListPerCategoryCsv(
  items: PriceItem[],
  discountRules: PriceDiscountRule[] = [],
  options?: ExportFilterSortOptions
): Promise<void> {
  const processedItems = options ? filterAndSortItems(items, options) : [...items];
  const includeEconomics = options?.includeEconomics !== false;
  const dateStr = new Date().toISOString().slice(0, 10);

  if (typeof document === 'undefined') {
    return;
  }

  const categories = [
    { cat: 'hardware', name: '1_Оборудование_КИМ_и_3D' },
    { cat: 'software', name: '2_Программное_обеспечение' },
    { cat: 'services', name: '3_Инжиниринговые_услуги' },
    { cat: 'accessories', name: '4_Оснастка_и_щупы_Renishaw' },
    { cat: 'non_core_services', name: '5_Сервис_и_калибровка_АРШИН' }
  ];

  for (let i = 0; i < categories.length; i++) {
    const { cat, name } = categories[i];
    const catItems = processedItems.filter(item => item.category === cat);
    if (catItems.length === 0) continue;

    const csvContent = '\uFEFF' + buildCsvRows(catItems, discountRules, includeEconomics);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Прайс_${name}_${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Short delay between downloads to prevent browser throttling
    await new Promise(r => setTimeout(r, 250));
  }
}
