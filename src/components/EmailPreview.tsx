import { EmailPreview as EmailPreviewType } from '@/types/comex';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Copy, Mail } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface EmailPreviewProps {
  email: EmailPreviewType;
  onClose: () => void;
}

export function EmailPreview({ email, onClose }: EmailPreviewProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(email.corpo);
    toast({
      title: 'Copiado!',
      description: 'O conteúdo do e-mail foi copiado para a área de transferência.',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl border-slate-200 shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-indigo-600" />
            <CardTitle>Preview do E-mail</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-600">Para:</div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
              {email.destinatario}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-600">Assunto:</div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold">
              {email.assunto}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-600">Corpo do E-mail:</div>
            <div className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm whitespace-pre-wrap font-mono">
              {email.corpo}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleCopy} className="flex items-center gap-2">
              <Copy className="h-4 w-4" />
              Copiar Conteúdo
            </Button>
            <Button onClick={onClose}>Fechar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}








