import type { Branch } from "@99billiards/db/seed";

interface AdminBranch extends Branch {
  _id?: string;
}

export function BranchMultiSelect({
  branches,
  defaultValues = [],
}: {
  branches: AdminBranch[];
  defaultValues?: string[];
}) {
  const selected = new Set(defaultValues);

  return (
    <div className="grid gap-2 text-sm font-bold text-[#2b332d]">
      <span>Cơ sở áp dụng</span>
      {branches.length ? (
        <div className="grid max-h-72 gap-2 overflow-auto rounded-lg border border-[#dfe3d8] bg-[#f8faf5] p-3 md:grid-cols-2">
          {branches.map((branch) => (
            <label
              key={branch.id}
              className="flex min-h-10 items-center gap-2 rounded-md border border-[#dfe3d8] bg-white px-3 py-2 text-sm font-bold"
            >
              <input name="branchIds" type="checkbox" value={branch.id} defaultChecked={selected.has(branch.id)} />
              <span className="min-w-0">
                <span className="block truncate">{branch.name}</span>
                <span className="block text-xs text-[#657064]">{branch.code || branch.id}</span>
              </span>
            </label>
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800">
          Chưa có cơ sở để chọn.
        </div>
      )}
    </div>
  );
}
