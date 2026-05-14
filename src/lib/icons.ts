
/**
 * Utilitário para mapeamento inteligente de ícones do Material Symbols
 * baseado em palavras-chave no texto.
 */

const iconMap: Record<string, string[]> = {
  // Alimentação & Cozinha
  'restaurant': ['lanche', 'comida', 'refeição', 'almoço', 'jantar', 'prato'],
  'lunch_dining': ['hamburguer', 'burger', 'cheeseburger', 'sanduíche', 'artesanal'],
  'meat_service': ['carne', 'churrasco', 'picanha', 'frango', 'bq', 'steak', 'proteina'],
  'egg': ['ovo', 'omelete', 'mexido'],
  'local_pizza': ['pizza', 'calzone', 'massa'],
  'bakery_dining': ['pão', 'padaria', 'croissant', 'doce', 'confeitaria', 'farinha'],
  'ramen_dining': ['macarrão', 'massa', 'italiana', 'yakisoba', 'japonesa'],
  'skillet': ['chapa', 'grelha', 'fogão', 'preparo'],
  'kitchen_detective': ['insumo', 'ingrediente', 'estoque', 'matéria-prima'],
  'set_meal': ['porção', 'entrada', 'petisco', 'batata', 'fritas', 'nuggets'],
  
  // Bebidas
  'liquor': ['bebida', 'destilado', 'whisky', 'vodka', 'gin', 'cachaca'],
  'sports_bar': ['cerveja', 'chope', 'chopp', 'artesanal', 'breja', 'pilsen'],
  'wine_bar': ['vinho', 'tinto', 'branco', 'rose', 'adega'],
  'local_cafe': ['café', 'espresso', 'cappuccino', 'quente', 'chá'],
  'local_drink': ['suco', 'refrigerante', 'refri', 'água', 'tônica', 'h2o', 'copo'],
  
  // Operações & Delivery
  'delivery_dining': ['delivery', 'entrega', 'motoboy', 'ifood', 'pedido'],
  'shopping_cart': ['compra', 'mercado', 'fornecedor', 'reposição'],
  'cleaning_services': ['limpeza', 'higiene', 'detergente', 'sabão', 'manutenção'],
  'inventory': ['geral', 'almoxarifado', 'depósito'],
  'group': ['cliente', 'mesa', 'atendimento', 'staff'],
  'payments': ['caixa', 'pagamento', 'financeiro', 'venda', 'vaturamento'],
};

export function getSmartIcon(text: string): string {
  const lowerText = text.toLowerCase().trim();
  
  for (const [icon, keywords] of Object.entries(iconMap)) {
    if (keywords.some(k => lowerText.includes(k))) {
      return icon;
    }
  }
  
  // Default fallback por contexto
  if (lowerText.length < 3) return 'category';
  return 'inventory_2';
}
