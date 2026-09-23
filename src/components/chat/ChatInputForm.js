import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function ChatInputForm({ value, onChange, onSubmit, placeholder, disabled, submitLabel = "Send" }) {
  return (
    <form className="mt-3.5 flex gap-2.5" onSubmit={onSubmit}>
      <Input
        className="flex-1 rounded-[24px]"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        disabled={disabled}
      />
      <Button variant="pill" type="submit" className="flex items-center gap-1.5 px-5" disabled={disabled}>
        {submitLabel}
        <Send size={15} strokeWidth={2.5} />
      </Button>
    </form>
  );
}
