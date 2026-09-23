import { Send, Smile } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmojiPickerButton } from "@/components/ui/EmojiPickerButton";

export function ChatInputForm({ value, onChange, onSubmit, onEmojiSelect, placeholder, disabled, submitLabel = "Send" }) {
  return (
    <form className="mt-3.5 flex items-center gap-2" onSubmit={onSubmit}>
      {onEmojiSelect && (
        <EmojiPickerButton
          icon={<Smile size={20} strokeWidth={2} />}
          label="Add emoji"
          onSelect={onEmojiSelect}
          buttonClassName="h-10 w-10 shrink-0"
        />
      )}
      <Input
        className="flex-1 rounded-[24px]"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        disabled={disabled}
      />
      <Button variant="pill" type="submit" className="flex shrink-0 items-center gap-1.5 px-5" disabled={disabled}>
        {submitLabel}
        <Send size={15} strokeWidth={2.5} />
      </Button>
    </form>
  );
}
