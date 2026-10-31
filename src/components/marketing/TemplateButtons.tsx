// Botões de templates pré-configurados para posts do Facebook
'use client';

interface Template {
  id: string;
  label: string;
  message: string;
  link?: string;
  icon: string;
}

const TEMPLATES: Template[] = [
  {
    id: 'stock-alert',
    label: 'Alerta de Estoque',
    icon: '📦',
    message: '🚨 Atenção! Alguns produtos estão com stock baixo. Reponha agora para não perder vendas! 📦',
  },
  {
    id: 'service-order',
    label: 'Ordem de Serviço',
    icon: '🔧',
    message: '🔧 Manutenção programada! Nosso sistema estará ainda melhor em breve. Agradecemos a compreensão! ⚙️',
  },
  {
    id: 'open-register',
    label: 'Abertura de Caixa',
    icon: '✅',
    message: '✅ Caixa aberto! Estamos prontos para atender você com o melhor sistema de PDV. 💼',
  },
  {
    id: 'trial-promo',
    label: 'Promoção Trial',
    icon: '🎉',
    message: '🎉 Experimente o Montante GRÁTIS por 3 meses! Sistema completo de PDV para o seu negócio. Teste agora! 🚀',
    link: 'https://montante.app/trial',
  },
];

interface TemplateButtonsProps {
  onSelect: (message: string, link?: string) => void;
}

export function TemplateButtons({ onSelect }: TemplateButtonsProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-gray-700">Templates Pré-configurados</p>
      <div className="grid grid-cols-2 gap-2">
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template.message, template.link)}
            className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
            aria-label={`Usar template: ${template.label}`}
          >
            <span className="text-lg" aria-hidden="true">{template.icon}</span>
            <span>{template.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
