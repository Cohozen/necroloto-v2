import type { LucideIcon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface SettingToggleRowProps {
    icon: LucideIcon;
    title: string;
    description: string;
    defaultChecked?: boolean;
}

/** Season-setting row (nl-setrow) — icon, label, description and a toggle. */
export function SettingToggleRow({
    icon: Icon,
    title,
    description,
    defaultChecked,
}: SettingToggleRowProps) {
    return (
        <div className="flex items-center gap-3.5 rounded-[13px] border border-line bg-surface p-3.5">
            <span className="flex size-[38px] shrink-0 items-center justify-center rounded-[11px] border border-neon/25 bg-neon/10 text-neon">
                <Icon size={19} />
            </span>
            <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">{title}</div>
                <div className="mt-0.5 text-xs text-ink-3">{description}</div>
            </div>
            <Switch defaultChecked={defaultChecked} />
        </div>
    );
}
