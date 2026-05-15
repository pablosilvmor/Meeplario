
/**
 * Utilitário para mapeamento inteligente de ícones do Material Symbols
 * baseado em palavras-chave no texto.
 */

const iconMap: Record<string, string[]> = {
  // Lanches e Sanduíches
  'lunch_dining': ['lanche', 'hamburguer', 'burger', 'cheeseburger', 'sanduíche', 'artesanal'],
  'bakery_dining': ['pão', 'trigo', 'farinha', 'panko'],
  
  // Condimentos e Ingredientes Adicionais
  'outdoor_grill': ['bacon'],
  'eco': ['alface', 'picles', 'cebola'],
  'local_pizza': ['mussarela', 'cheddar', 'queijo', 'gorgonzola', 'pizza', 'calzone'],
  'egg_alt': ['ovo', 'omelete', 'mexido'],
  'grass': ['tomate', 'hortelã'],
  
  // Molhos
  'blender': ['molho', 'maionese', 'mostarda', 'ketchup', 'katchup', 'barbecue', 'baconese', 'blister', 'copinho'],
  'science': ['páprica', 'corante', 'pasta'],

  // Carnes
  'set_meal': ['bife', 'carne', 'churrasco', 'picanha', 'steak', 'costela', 'porção', 'petisco'],
  'kebab_dining': ['frango', 'nuggets', 'empanar', 'linguiça'],
  
  // Acompanhamentos e Opcionais
  'fastfood': ['batata', 'frita', 'jenga', 'aneis'],
  'grain': ['açúcar', 'açucar', 'canela', 'sal', 'parrilha'],
  
  // Sobremesas
  'cake': ['brownie', 'doce', 'bolo'],
  'icecream': ['sorvete', 'morango', 'tropical', 'céu azul', 'blue ice', 'caramelo', 'amora', 'baunilha'],
  'cookie': ['marshmellow', 'balinha', 'bala', 'unicórnio', 'chocolate', 'glitter', 'avelã', 'nutella', 'churros'],
  
  // Bebidas
  'local_drink': ['coca', 'guaraná', 'sprite', 'schweppes', 'fanta', 'refrigerante', 'suco', 'água', 'bebida'],
  'bolt': ['monster', 'energético'],
  'sports_bar': ['cerveja', 'latão', 'chopp', 'breja'],
  'ac_unit': ['gelo'],
  'lemon': ['limão'],
  'water_drop': ['polpa', 'leite'],
  'emoji_food_beverage': ['café', 'chá', 'quente'],

  // Embalagens e Delivery
  'takeout_dining': ['sacola', 'delivery', 'sachê'],
  'receipt_long': ['bobina', 'impressora', 'nota', 'cupom', 'papel', 'toalha', 'guardanapo', 'insulfilme', 'insufilme'],
  
  // Cozinha e Limpeza
  'propane': ['gás', 'maçarico'],
  'sanitizer': ['desinfetante', 'detergente', 'desengordurante', 'sapólio', 'álcool', 'limpeza'],
  'cleaning_bucket': ['bucha', 'esponja', 'palha', 'aço'],
  'delete': ['saco', 'lixo', 'lixeira'],
  'flatware': ['espátula', 'talher', 'faca', 'colher'],
  'hardware': ['palito', 'dente'],
  
  // Banheiro
  'wc': ['banheiro', 'higiênico', 'higienico', 'absorvente'],
  'wash': ['sabão', 'sabonete', 'lenço', 'umidecido', 'fio dental'],
  'spa': ['desodorante', 'aromatizante', 'bom ar'],

  // Outros e Setores
  'inventory': ['geral', 'almoxarifado', 'depósito'],
  'group': ['cliente', 'mesa', 'atendimento', 'staff'],
  'payments': ['caixa', 'pagamento', 'financeiro', 'venda', 'vaturamento'],
  'kitchen': ['cozinha', 'geladeira', 'fogão', 'chapa'],
};

export const availableIcons = Object.keys(iconMap);

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
