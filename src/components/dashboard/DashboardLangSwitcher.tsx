import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** English + Khmer only */
export default function DashboardLangSwitcher({ className }: { className?: string }) {
  const { lang, setLang } = useLanguage();

  return (
    <div className={cn('inline-flex rounded-full border border-border p-0.5 bg-muted/30', className)}>
      <Button
        type="button"
        size="sm"
        variant={lang === 'en' ? 'default' : 'ghost'}
        className="rounded-full h-8 px-3 text-xs font-dashboard"
        onClick={() => setLang('en')}
      >
        EN
      </Button>
      <Button
        type="button"
        size="sm"
        variant={lang === 'km' ? 'default' : 'ghost'}
        className="rounded-full h-8 px-3 text-xs font-khmer"
        onClick={() => setLang('km')}
      >
        ខ្មែរ
      </Button>
    </div>
  );
}
