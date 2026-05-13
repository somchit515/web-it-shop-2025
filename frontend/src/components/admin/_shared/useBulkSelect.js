// useBulkSelect.js — hook สำหรับจัดการ checkbox select หลายรายการ
// ใช้:
//   const bulk = useBulkSelect(items, (item) => item._id);
//   <input type="checkbox" checked={bulk.isAllSelected} onChange={bulk.toggleAll} />
//   <input type="checkbox" checked={bulk.isSelected(id)} onChange={() => bulk.toggle(id)} />
//   bulk.selectedIds  // Array ของ id ที่เลือก
//   bulk.selectedCount
//   bulk.clear()

import { useCallback, useEffect, useMemo, useState } from 'react';

export default function useBulkSelect(items = [], getId = (item) => item.id || item._id) {
  const [selectedSet, setSelectedSet] = useState(() => new Set());

  // เมื่อ items เปลี่ยน — เอา id ที่ไม่มีในรายการใหม่ออก
  const allIds = useMemo(() => items.map(getId).filter(Boolean), [items, getId]);

  useEffect(() => {
    setSelectedSet((prev) => {
      const valid = new Set(allIds);
      const next = new Set();
      prev.forEach((id) => {
        if (valid.has(id)) next.add(id);
      });
      return next.size === prev.size ? prev : next;
    });
  }, [allIds]);

  const toggle = useCallback((id) => {
    setSelectedSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedSet((prev) => {
      // ถ้าเลือกครบแล้ว → clear / ไม่เช่นนั้น → select ทั้งหมด
      if (prev.size === allIds.length && allIds.length > 0) return new Set();
      return new Set(allIds);
    });
  }, [allIds]);

  const clear = useCallback(() => setSelectedSet(new Set()), []);

  const isSelected = useCallback((id) => selectedSet.has(id), [selectedSet]);

  const selectedIds = useMemo(() => Array.from(selectedSet), [selectedSet]);

  const isAllSelected = allIds.length > 0 && selectedSet.size === allIds.length;
  const isPartial = selectedSet.size > 0 && selectedSet.size < allIds.length;

  return {
    selectedIds,
    selectedSet,
    selectedCount: selectedSet.size,
    isSelected,
    isAllSelected,
    isPartial,
    toggle,
    toggleAll,
    clear,
  };
}
