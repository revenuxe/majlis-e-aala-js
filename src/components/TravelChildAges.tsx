export function TravelChildAges({
  ages,
  onChange,
}: {
  ages: number[];
  onChange: (index: number, age: number) => void;
}) {
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {ages.map((age, index) => (
        <label key={index} className="text-sm font-semibold">
          Child {index + 1} · age at travel
          <select
            className="mt-2 h-12 w-full rounded-xl border border-border bg-card px-3 text-sm"
            value={age < 0 ? "" : age}
            onChange={(event) => onChange(index, Number(event.target.value))}
          >
            <option value="" disabled>
              Choose age
            </option>
            {Array.from({ length: 18 }, (_, i) => (
              <option key={i} value={i}>
                {i === 0 ? "Under 1 year" : `${i} ${i === 1 ? "year" : "years"}`}
              </option>
            ))}
          </select>
        </label>
      ))}
    </div>
  );
}
