import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface BaseProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  /** Shown under the label. For a hint, not for an error. */
  hint?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  autoComplete?: string;
  onBlur?: () => void;
}

/**
 * Every field on the site. The label is always present and always visible —
 * placeholder-as-label disappears the moment someone starts typing, which is
 * exactly when they most need to know what they are filling in.
 *
 * An error is tied to the input with `aria-describedby` and announced through
 * a live region, so it reaches someone who cannot see it turn red.
 */
export function Field({
  label,
  value,
  onChange,
  error,
  hint,
  required,
  placeholder,
  className,
  autoComplete,
  onBlur,
  type = 'text',
  inputMode,
}: BaseProps & {
  type?: 'text' | 'email' | 'tel' | 'number';
  inputMode?: 'text' | 'email' | 'tel' | 'numeric';
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label htmlFor={id} className="t-label">
        {label}
        {required && <span className="ml-1 text-neon" aria-hidden="true">*</span>}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      {hint && (
        <p id={hintId} className="text-[12.5px] text-faint">
          {hint}
        </p>
      )}
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={cn(error && errorId, hint && hintId) || undefined}
        aria-required={required}
        className="field"
      />
      <FieldError id={errorId} message={error} />
    </div>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  error,
  hint,
  required,
  placeholder,
  className,
  rows = 4,
  onBlur,
}: BaseProps & { rows?: number }) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label htmlFor={id} className="t-label">
        {label}
        {required && <span className="ml-1 text-neon" aria-hidden="true">*</span>}
      </label>
      {hint && (
        <p id={hintId} className="text-[12.5px] text-faint">
          {hint}
        </p>
      )}
      <textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={cn(error && errorId, hint && hintId) || undefined}
        aria-required={required}
        className="field resize-y"
      />
      <FieldError id={errorId} message={error} />
    </div>
  );
}

export function Select({
  label,
  value,
  onChange,
  options,
  error,
  hint,
  required,
  className,
  placeholder = 'Choose one',
}: BaseProps & { options: { value: string; label: string }[] }) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label htmlFor={id} className="t-label">
        {label}
        {required && <span className="ml-1 text-neon" aria-hidden="true">*</span>}
      </label>
      {hint && <p className="text-[12.5px] text-faint">{hint}</p>}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        className="field field-select"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <FieldError id={errorId} message={error} />
    </div>
  );
}

/** The error line. Always in the DOM as a live region so it is announced. */
export function FieldError({ id, message }: { id?: string; message?: string }) {
  return (
    <p
      id={id}
      role="alert"
      aria-live="polite"
      className={cn(
        'overflow-hidden text-[12.5px] text-bad transition-all duration-200 ease-[cubic-bezier(.23,1,.32,1)]',
        message ? 'mt-1 max-h-12 opacity-100' : 'max-h-0 opacity-0',
      )}
    >
      {message}
    </p>
  );
}

/** A labelled group, for radio-like sets of cards. */
export function FieldGroup({
  label,
  hint,
  children,
  error,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  error?: string;
}) {
  return (
    <fieldset className="border-0 p-0">
      <legend className="t-label mb-1">{label}</legend>
      {hint && <p className="mb-4 text-[12.5px] text-faint">{hint}</p>}
      {children}
      <FieldError message={error} />
    </fieldset>
  );
}
