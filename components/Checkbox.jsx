export default function Checkbox({
  id,
  label,
  checked,
  defaultChecked,
  onChange,
  name,
  disabled = false,
  className = "",
}) {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={onChange}
        disabled={disabled}
        className={`mr-2 ${className}`}
      />
      <label htmlFor={id} className="text-sm text-zinc-600 dark:text-zinc-400">
        {label}
      </label>
    </div>
  );
}
