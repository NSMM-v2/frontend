"use client";

import { useState, useEffect } from "react";
import Papa from "papaparse";

interface CO2Data {
  category: string;
  separate: string;
  RawMaterial: string;
  unit: string;
  kgCO2eq: number;
}

interface ExcelCascadingSelectorProps {
  id: number;
  onChangeTotal: (id: number, emission: number) => void;
}

export default function ExcelCascadingSelector({ id, onChangeTotal }: ExcelCascadingSelectorProps) {
  const [data, setData] = useState<CO2Data[]>([]);
  const [category, setCategory] = useState("");
  const [separate, setSeparate] = useState("");
  const [rawMaterial, setRawMaterial] = useState("");
  const [selectedItem, setSelectedItem] = useState<CO2Data | null>(null);
  const [quantity, setQuantity] = useState<number>(0); // 수량

  useEffect(() => {
    fetch("/co2.csv")
      .then((res) => res.text())
      .then((csvText) => {
        const results = Papa.parse(csvText, { header: true });
        const parsed = (results.data as any[]).map((row) => ({
          category: row["대분류"],
          separate: row["구분"],
          RawMaterial: row["원료/에너지"],
          unit: row["단위"],
          kgCO2eq: parseFloat(row["탄소발자국"]),
        }));
        setData(parsed);
      });
  }, []);

  const unique = (arr: string[]) => [...new Set(arr)];

  const categoryList = unique(data.map((d) => d.category));
  const separateList = unique(data.filter((d) => d.category === category).map((d) => d.separate));
  const rawMaterialList = unique(
    data
      .filter((d) => d.category === category && d.separate === separate)
      .map((d) => d.RawMaterial)
  );

  const handleSelect = (value: string, type: "category" | "separate" | "raw") => {
    if (type === "category") {
      setCategory(value);
      setSeparate("");
      setRawMaterial("");
      setSelectedItem(null);
      setQuantity(0);
      onChangeTotal(id, 0); // 초기화
    } else if (type === "separate") {
      setSeparate(value);
      setRawMaterial("");
      setSelectedItem(null);
      setQuantity(0);
      onChangeTotal(id, 0); // 초기화
    } else if (type === "raw") {
      setRawMaterial(value);
      const selected = data.find(
        (d) =>
          d.category === category &&
          d.separate === separate &&
          d.RawMaterial === value
      );
      if (selected) {
        setSelectedItem(selected);
        setQuantity(0);
        onChangeTotal(id, 0); // 초기화
      }
    }
  };

  const handleQuantityChange = (value: string) => {
    const num = parseFloat(value);
    setQuantity(num);

    if (selectedItem && !isNaN(num)) {
      const emission = num * selectedItem.kgCO2eq;
      onChangeTotal(id, emission);
    } else {
      onChangeTotal(id, 0);
    }
  };

  return (
    <div className="p-4 border rounded w-full max-w-md shadow-sm">
      <div className="mb-4">
        <label className="block mb-1">대분류 (category)</label>
        <select
          value={category}
          onChange={(e) => handleSelect(e.target.value, "category")}
          className="border px-2 py-1 w-full"
        >
          <option value="">선택하세요</option>
          {categoryList.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {category && (
        <div className="mb-4">
          <label className="block mb-1">구분 (separate)</label>
          <select
            value={separate}
            onChange={(e) => handleSelect(e.target.value, "separate")}
            className="border px-2 py-1 w-full"
          >
            <option value="">선택하세요</option>
            {separateList.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}

      {separate && (
        <div className="mb-4">
          <label className="block mb-1">원료/에너지 (RawMaterial)</label>
          <select
            value={rawMaterial}
            onChange={(e) => handleSelect(e.target.value, "raw")}
            className="border px-2 py-1 w-full"
          >
            <option value="">선택하세요</option>
            {rawMaterialList.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedItem && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <label className="block mb-2">
            수량 입력 ({selectedItem.unit}당 kgCO₂: {selectedItem.kgCO2eq})
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => handleQuantityChange(e.target.value)}
            placeholder={selectedItem.unit}
            className="border px-2 py-1 w-full"
          />
          <div className="mt-2 font-semibold">
            ➤ 배출량: {(quantity * selectedItem.kgCO2eq).toFixed(2)} kgCO₂
          </div>
        </div>
      )}
    </div>
  );
}
