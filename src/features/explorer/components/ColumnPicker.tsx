"use client";

import { Columns3 } from "lucide-react";
import type { DatasetField } from "@/features/datasets/types";

interface Props {
  fields: DatasetField[];
  visibleKeys: string[];
  onChange: (keys: string[]) => void;
}

export default function ColumnPicker({ fields, visibleKeys, onChange }: Props) {
  const visible = new Set(visibleKeys);
  const defaults = fields.filter((f) => f.isVisibleByDefault).map((f) => f.key);

  function toggle(key: string) {
    const next = new Set(visible);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(fields.filter((f) => next.has(f.key)).map((f) => f.key)); // keep dataset order
  }

  return (
    <details className="dropdown dropdown-end">
      <summary className="btn btn-sm">
        <Columns3 className="size-4" /> Columns
        <span className="badge badge-sm">{visibleKeys.length}</span>
      </summary>
      <div className="dropdown-content z-30 mt-1 w-64 rounded-box border border-base-300 bg-base-100 p-3 shadow-lg">
        <ul className="max-h-72 space-y-1 overflow-y-auto">
          {fields.map((f) => {
            const checked = visible.has(f.key);
            return (
              <li key={f.key}>
                <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm hover:bg-base-200">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={checked}
                    // the table always keeps at least one column
                    disabled={checked && visibleKeys.length === 1}
                    onChange={() => toggle(f.key)}
                  />
                  {f.label}
                </label>
              </li>
            );
          })}
        </ul>
        <button type="button" className="btn btn-ghost btn-xs mt-2 w-full" onClick={() => onChange(defaults)}>
          Reset to default
        </button>
      </div>
    </details>
  );
}
